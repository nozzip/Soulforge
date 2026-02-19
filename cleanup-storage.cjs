/**
 * Script de limpieza de Supabase Storage
 * 1. Elimina imágenes duplicadas (conserva la referenciada por el producto)
 * 2. Conecta archivos de gallery/ al campo gallery_images de cada producto
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DRY_RUN = process.argv.includes("--dry-run");

async function listAllFiles(bucket, folder = "") {
    const allFiles = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder, { limit, offset, sortBy: { column: "name", order: "asc" } });

        if (error || !data || data.length === 0) break;

        for (const item of data) {
            const fullPath = folder ? `${folder}/${item.name}` : item.name;
            if (item.id) {
                allFiles.push({ path: fullPath, name: item.name, folder });
            } else {
                const sub = await listAllFiles(bucket, fullPath);
                allFiles.push(...sub);
            }
        }
        if (data.length < limit) break;
        offset += limit;
    }
    return allFiles;
}

async function cleanDuplicates() {
    console.log("\n🧹 PASO 1: Limpieza de duplicados\n");

    // Obtener productos y sus URLs actuales
    const { data: products } = await supabase
        .from("products")
        .select("id, name, image, image_url");

    // Crear set de paths actualmente en uso
    const usedPaths = new Set();
    for (const p of products || []) {
        for (const url of [p.image, p.image_url]) {
            if (!url) continue;
            const match = url.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
            if (match) usedPaths.add(decodeURIComponent(match[1]));
        }
    }
    console.log(`  📌 Paths referenciados por productos: ${usedPaths.size}`);

    // Listar todos los archivos (excluyendo gallery/)
    const allFiles = await listAllFiles("products");
    const nonGalleryFiles = allFiles.filter((f) => !f.path.startsWith("gallery/"));
    console.log(`  📁 Archivos totales (sin gallery): ${nonGalleryFiles.length}`);

    // Agrupar por nombre base (sin timestamp)
    const nameMap = {};
    for (const file of nonGalleryFiles) {
        const baseName = file.name.replace(/^\d+_/, "");
        if (!nameMap[baseName]) nameMap[baseName] = [];
        nameMap[baseName].push(file.path);
    }

    // Identificar archivos a eliminar
    const toDelete = [];
    for (const [baseName, paths] of Object.entries(nameMap)) {
        if (paths.length <= 1) continue;

        // Conservar el que está referenciado por un producto
        const referencedPath = paths.find((p) => usedPaths.has(p));

        for (const p of paths) {
            if (p === referencedPath) continue; // Conservar este
            if (!referencedPath && p === paths[paths.length - 1]) continue; // Si ninguno está referenciado, conservar el último
            toDelete.push(p);
        }
    }

    console.log(`  🗑️  Archivos a eliminar: ${toDelete.length}`);
    console.log(`  ✅ Archivos a conservar: ${nonGalleryFiles.length - toDelete.length}`);

    if (DRY_RUN) {
        console.log("\n  [DRY RUN] No se eliminará nada. Ejemplos:");
        toDelete.slice(0, 5).forEach((p) => console.log(`    - ${p}`));
        return;
    }

    // Eliminar en lotes de 20
    let deleted = 0;
    for (let i = 0; i < toDelete.length; i += 20) {
        const batch = toDelete.slice(i, i + 20);
        const { error } = await supabase.storage.from("products").remove(batch);
        if (error) {
            console.error(`  ❌ Error eliminando lote ${i}: ${error.message}`);
        } else {
            deleted += batch.length;
            process.stdout.write(`\r  🗑️  Eliminados: ${deleted}/${toDelete.length}`);
        }
    }
    console.log(`\n  ✅ Limpieza completada: ${deleted} archivos eliminados`);
}

async function connectGallery() {
    console.log("\n🔗 PASO 2: Conectar gallery → productos\n");

    // Listar archivos en gallery/
    const galleryFiles = await listAllFiles("products", "gallery");
    console.log(`  📁 Archivos en gallery/: ${galleryFiles.length}`);

    if (galleryFiles.length === 0) {
        console.log("  No hay archivos de galería. Saltando.");
        return;
    }

    // Extraer product_id del nombre: gallery-{uuid}-{timestamp}.ext
    const productGalleryMap = {};
    for (const file of galleryFiles) {
        // Pattern: gallery/gallery-{uuid}-{timestamp}.ext
        const match = file.name.match(
            /^gallery-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-\d+\.\w+$/,
        );
        if (match) {
            const productId = match[1];
            if (!productGalleryMap[productId]) productGalleryMap[productId] = [];

            // Generar URL pública
            const { data } = supabase.storage
                .from("products")
                .getPublicUrl(file.path);
            productGalleryMap[productId].push(data.publicUrl);
        } else {
            console.log(`  ⚠️  No se pudo extraer UUID de: ${file.name}`);
        }
    }

    const productIds = Object.keys(productGalleryMap);
    console.log(`  📦 Productos con galería: ${productIds.length}`);

    // Verificar que los product IDs existen
    const { data: existingProducts } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

    const existingIds = new Set((existingProducts || []).map((p) => p.id));
    console.log(`  ✅ IDs válidos: ${existingIds.size}`);

    const orphaned = productIds.filter((id) => !existingIds.has(id));
    if (orphaned.length > 0) {
        console.log(`  ⚠️  IDs sin producto correspondiente: ${orphaned.length}`);
        orphaned.forEach((id) =>
            console.log(`    - ${id} (${productGalleryMap[id].length} imágenes)`),
        );

        // Eliminar archivos de gallery huérfanos
        const orphanFiles = galleryFiles
            .filter((f) => {
                const match = f.name.match(
                    /^gallery-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-/,
                );
                return match && orphaned.includes(match[1]);
            })
            .map((f) => f.path);

        if (!DRY_RUN && orphanFiles.length > 0) {
            console.log(`\n  🗑️  Eliminando ${orphanFiles.length} archivos de gallery huérfanos...`);
            const { error } = await supabase.storage.from("products").remove(orphanFiles);
            if (error) {
                console.error(`  ❌ Error: ${error.message}`);
            } else {
                console.log(`  ✅ ${orphanFiles.length} archivos de gallery eliminados`);
            }
        } else if (DRY_RUN) {
            console.log(`\n  [DRY RUN] Se eliminarían ${orphanFiles.length} archivos de gallery huérfanos`);
        }
    }

    if (DRY_RUN) {
        console.log("\n  [DRY RUN] Cambios que se harían:");
        for (const p of existingProducts || []) {
            const urls = productGalleryMap[p.id];
            if (urls) {
                console.log(`    ${p.name}: ${urls.length} imágenes de galería`);
            }
        }
        return;
    }

    // Actualizar cada producto con sus gallery_images
    let updated = 0;
    for (const productId of productIds) {
        if (!existingIds.has(productId)) continue;

        const galleryUrls = productGalleryMap[productId];
        const { error } = await supabase
            .from("products")
            .update({ gallery_images: galleryUrls })
            .eq("id", productId);

        if (error) {
            console.error(`  ❌ Error actualizando ${productId}: ${error.message}`);
        } else {
            updated++;
            const productName =
                existingProducts.find((p) => p.id === productId)?.name || productId;
            console.log(`  ✅ ${productName}: ${galleryUrls.length} imágenes asignadas`);
        }
    }

    console.log(`\n  🎉 Galería conectada: ${updated} productos actualizados`);
}

async function main() {
    console.log("=".repeat(60));
    console.log(DRY_RUN ? "🔍 MODO DRY RUN (sin cambios reales)" : "🚀 MODO EJECUCIÓN");
    console.log("=".repeat(60));

    await cleanDuplicates();
    await connectGallery();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Proceso completado");
    console.log("=".repeat(60));
}

main().catch(console.error);
