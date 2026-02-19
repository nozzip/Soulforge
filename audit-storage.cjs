/**
 * Script de diagnóstico de Supabase Storage
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllFiles(bucket, folder = "", allFiles = []) {
    let offset = 0;
    const limit = 100;

    while (true) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, { limit, offset, sortBy: { column: "name", order: "asc" } });

        if (error) {
            console.error(`  Error listando ${bucket}/${folder}:`, error.message);
            break;
        }
        if (!data || data.length === 0) break;

        for (const item of data) {
            const fullPath = folder ? `${folder}/${item.name}` : item.name;
            if (item.id) {
                allFiles.push({ path: fullPath, name: item.name, folder });
            } else {
                // Subcarpeta
                await listAllFiles(bucket, fullPath, allFiles);
            }
        }

        if (data.length < limit) break;
        offset += limit;
    }

    return allFiles;
}

async function diagnose() {
    console.log("🔍 Diagnóstico de Supabase Storage\n");
    console.log("=".repeat(60));

    // 1. Listar buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("\n📦 Buckets:");
    for (const b of buckets || []) {
        console.log(`  - ${b.name} (público: ${b.public})`);
    }

    // 2. Listar TODOS los archivos del bucket "products"
    console.log("\n" + "=".repeat(60));
    console.log("📁 Archivos en bucket 'products':");
    const allFiles = await listAllFiles("products");
    console.log(`  Total: ${allFiles.length} archivos`);

    // Agrupar por carpeta
    const folders = {};
    for (const f of allFiles) {
        const dir = f.folder || "(raíz)";
        if (!folders[dir]) folders[dir] = [];
        folders[dir].push(f);
    }
    console.log("\n  Por carpeta:");
    for (const [dir, files] of Object.entries(folders)) {
        console.log(`    📂 ${dir}: ${files.length} archivos`);
    }

    // 3. Buscar duplicados por nombre base (quitar timestamp)
    console.log("\n" + "=".repeat(60));
    console.log("🔄 Análisis de duplicados:");

    const nameMap = {};
    for (const file of allFiles) {
        const baseName = file.name.replace(/^\d+_/, "");
        if (!nameMap[baseName]) nameMap[baseName] = [];
        nameMap[baseName].push(file.path);
    }

    const duplicates = Object.entries(nameMap).filter(([, paths]) => paths.length > 1);
    console.log(`  Nombres únicos (sin timestamp): ${Object.keys(nameMap).length}`);
    console.log(`  Con duplicados: ${duplicates.length}`);

    if (duplicates.length > 0) {
        let totalExtra = 0;
        console.log("\n  Algunos duplicados:");
        duplicates.slice(0, 10).forEach(([name, paths]) => {
            totalExtra += paths.length - 1;
            console.log(`\n  📄 ${name} (${paths.length} copias):`);
            paths.forEach((p) => console.log(`     ${p}`));
        });

        const grandTotalExtra = duplicates.reduce((s, [, p]) => s + (p.length - 1), 0);
        console.log(`\n  ⚠️  Total de duplicados eliminables: ${grandTotalExtra}`);
    }

    // 4. Verificar gallery ↔ productos
    console.log("\n" + "=".repeat(60));
    console.log("🔗 Conexión Gallery → Productos:");

    const { data: products } = await supabase
        .from("products")
        .select("id, name, image, image_url, gallery_images");

    const totalProducts = (products || []).length;
    const withGallery = (products || []).filter(
        (p) => p.gallery_images && p.gallery_images.length > 0,
    );
    console.log(`  Productos totales: ${totalProducts}`);
    console.log(`  Con gallery_images: ${withGallery.length}`);
    console.log(`  Sin gallery_images: ${totalProducts - withGallery.length}`);

    // Verificar archivos de galería existentes en storage
    const galleryFolderFiles = allFiles.filter((f) => f.folder.startsWith("gallery"));
    if (galleryFolderFiles.length > 0) {
        console.log(`\n  Archivos en carpeta(s) gallery: ${galleryFolderFiles.length}`);

        // Ver cuáles de esas URLs están referenciadas
        const allProductUrls = (products || []).flatMap((p) => [
            p.image || "",
            p.image_url || "",
            ...(p.gallery_images || []),
        ]);

        let connected = 0;
        let disconnected = [];
        for (const gf of galleryFolderFiles) {
            const isUsed = allProductUrls.some((url) => url.includes(gf.path));
            if (isUsed) connected++;
            else disconnected.push(gf.path);
        }
        console.log(`  Conectados a productos: ${connected}`);
        console.log(`  Sin conexión: ${disconnected.length}`);
        disconnected.slice(0, 20).forEach((f) => console.log(`    ❌ ${f}`));
        if (disconnected.length > 20) console.log(`    ... y ${disconnected.length - 20} más`);
    } else {
        console.log(`\n  No se encontró carpeta 'gallery' en el bucket.`);

        // Buscar en otros buckets
        for (const b of buckets || []) {
            if (b.name === "products") continue;
            const bFiles = await listAllFiles(b.name, "gallery");
            if (bFiles.length > 0) {
                console.log(`  📂 Encontrada carpeta gallery en bucket '${b.name}': ${bFiles.length} archivos`);
                bFiles.slice(0, 10).forEach((f) => console.log(`    - ${f.path}`));
                if (bFiles.length > 10) console.log(`    ... y ${bFiles.length - 10} más`);
            }
        }
    }

    // 5. Verificar imágenes de productos apuntan a archivos reales
    console.log("\n" + "=".repeat(60));
    console.log("🖼️  URLs de productos vs Storage:");
    const storagePaths = new Set(allFiles.map((f) => f.path));
    let broken = 0;
    let valid = 0;
    for (const p of products || []) {
        const url = p.image || p.image_url || "";
        const match = url.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
        if (match) {
            const storagePath = decodeURIComponent(match[1]);
            if (storagePaths.has(storagePath)) valid++;
            else {
                broken++;
                if (broken <= 5) console.log(`  ⚠️  ${p.name}: ${storagePath}`);
            }
        }
    }
    console.log(`  URLs válidas: ${valid}`);
    console.log(`  URLs rotas: ${broken}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Diagnóstico completado\n");
}

diagnose().catch(console.error);
