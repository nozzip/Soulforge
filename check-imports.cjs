require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function go() {
    // Check imports/ contents
    const { data, error } = await s.storage.from("products").list("imports", { limit: 200 });
    if (error) { console.error("Error:", error.message); return; }

    const folders = (data || []).filter(i => !i.id);
    const files = (data || []).filter(i => i.id);
    console.log("Archivos directos en imports/:", files.length);
    console.log("Subcarpetas en imports/:", folders.map(f => f.name));

    for (const folder of folders) {
        const { data: sub } = await s.storage.from("products").list(`imports/${folder.name}`, { limit: 200 });
        const subFiles = (sub || []).filter(i => i.id);
        const subFolders = (sub || []).filter(i => !i.id);
        console.log(`\n  imports/${folder.name}/:`);
        console.log(`    Archivos: ${subFiles.length}`);
        if (subFolders.length) console.log(`    Subcarpetas: ${subFolders.map(f => f.name)}`);
        subFiles.slice(0, 5).forEach(f => console.log(`    - ${f.name}`));
        if (subFiles.length > 5) console.log(`    ... y ${subFiles.length - 5} más`);
    }

    // Check if any product references imports/imports/ path
    const { data: products } = await s.from("products").select("name, image").limit(5);
    console.log("\nEjemplo de URLs de productos:");
    (products || []).forEach(p => console.log(`  ${p.name}: ${(p.image || "").substring(p.image.lastIndexOf("/") - 10)}`));
}

go().catch(console.error);
