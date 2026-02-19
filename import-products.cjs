require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Faltan variables de entorno en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapeo de tamaños
const sizeMapping = {
  S: "Small",
  M: "Medium",
  L: "Large",
  H: "Huge",
  G: "Gargantuan",
};

/**
 * Calcula el precio basado en grado y tamaño
 */
function calculatePrice(grade, size) {
  const baseCosts = {
    Small: 1,
    Medium: 1.25,
    Large: 1.5,
    Huge: 2,
    Gargantuan: 4,
  };

  const gradeMultipliers = {
    C: 1.5, // Común
    R: 2.5, // Raro
    L: 4, // Legendario
  };

  const overhead = 1.25;
  const earnings = 1.35;
  const vat = 1.21;
  const currencyRate = 1000;

  const baseCost = baseCosts[size] || 0;
  const gradeMult = gradeMultipliers[grade] || 1;

  if (baseCost === 0) return 0;

  const finalPrice = Math.round(
    baseCost * gradeMult * overhead * earnings * vat,
  );
  return finalPrice; // Retorna en GP
}

/**
 * Descarga una imagen desde una URL
 */
async function downloadImage(url, dest) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadToSupabase(filePath, fileName, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Función principal de importación
 */
async function importProducts() {
  const results = [];
  const tempDir = "./temp_images";

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const csvFile = process.argv[2] || "products2.csv";
  console.log(`🚀 Iniciando importación desde: ${csvFile}`);

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ No se encontró el archivo: ${csvFile}`);
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(
        csv({
          separator: ";",
          headers: [
            "id",
            "imageSrc",
            "imagen_label", // Columna literal "Imagen"
            "name",
            "category",
            "designer",
            "set_name",
            "mime_type",
            "size",
            "creature_type",
            "weapon",
            "universe",
            "grade",
            "approved",
          ],
        }),
      )
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        try {
          // Filtrar por aprobado.
          const approvedProducts = results.filter((row) => {
            return row.approved && row.approved.trim().toLowerCase() === "si";
          });

          console.log(
            `📊 Se encontraron ${results.length} productos en el CSV`,
          );
          console.log(
            `✅ Se procesarán ${approvedProducts.length} productos aprobados`,
          );

          const { data: existingProducts } = await supabase
            .from("products")
            .select("name, image");

          const existingMap = new Map(
            (existingProducts || []).map((p) => [p.name, p.image]),
          );

          // List all files currently in Storage to check existence
          let storageFiles = new Set();
          let offset = 0;
          while (true) {
            const { data: files } = await supabase.storage
              .from("products")
              .list("", { limit: 1000, offset });
            if (!files || files.length === 0) break;
            files.filter((f) => f.id).forEach((f) => storageFiles.add(f.name));
            if (files.length < 1000) break;
            offset += 1000;
          }
          console.log(`📦 Archivos en Storage: ${storageFiles.size}`);

          let addedCount = 0;
          let updatedCount = 0;
          let reimagedCount = 0;
          let errorCount = 0;

          for (let i = 0; i < approvedProducts.length; i++) {
            const row = approvedProducts[i];

            if (!row.name) continue;

            const isExisting = existingMap.has(row.name);

            try {
              // 1. Calcular precio (común para nuevos y existentes)
              const rawGrade = (row.grade || "").trim().toUpperCase();
              const rawSize = (row.size || "").trim().toUpperCase();
              const rawCreatureType = (row.creature_type || "").trim();

              const validGrades = ["C", "R", "L"];
              const hasValidGrade = validGrades.includes(rawGrade);

              let size = "";
              let price = 0;
              let minPrice = 0;
              let maxPrice = 0;

              if (rawCreatureType.toLowerCase() === "statue") {
                price = 69;
                minPrice = 69;
                maxPrice = 69;
                size = rawSize
                  ? rawSize
                    .split("/")
                    .map((s) => sizeMapping[s.trim()] || s.trim())
                    .join(" - ")
                  : null;
              } else if (rawSize.includes("/") && hasValidGrade) {
                const sizeParts = rawSize.split("/").map((s) => s.trim());
                const mappedSizes = sizeParts
                  .map((s) => sizeMapping[s] || s)
                  .filter(Boolean);
                const prices = mappedSizes.map((s) =>
                  calculatePrice(rawGrade, s),
                );

                minPrice = Math.min(...prices);
                maxPrice = Math.max(...prices);
                price = minPrice;
                size = `${mappedSizes[0]} - ${mappedSizes[mappedSizes.length - 1]}`;
              } else {
                size = sizeMapping[rawSize] || rawSize;
                price = hasValidGrade ? calculatePrice(rawGrade, size) : 0;
                minPrice = price;
                maxPrice = price;
              }

              // Statues siempre individuales (no agrupar en set)
              const finalSetName = rawCreatureType.toLowerCase() === "statue"
                ? null
                : (row.set_name || null);

              if (isExisting) {
                // Verificar si la imagen existe en Storage
                const currentUrl = existingMap.get(row.name) || "";
                const match = currentUrl.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
                const storagePath = match ? decodeURIComponent(match[1]) : "";
                // Extraer solo el filename (sin carpetas)
                const fileName = storagePath.split("/").pop() || "";
                const imageExists = fileName && storageFiles.has(fileName);

                const updateData = {
                  price: price,
                  min_price: minPrice,
                  max_price: maxPrice,
                  set_name: finalSetName,
                };

                // Si la imagen no existe, re-subirla
                if (!imageExists && row.imageSrc) {
                  const newFileName = `${row.name.replace(/[^a-zA-Z0-9]/g, "_")}.${(row.mime_type || "image/jpeg").split("/")[1] || "jpg"}`;
                  const tempPath = path.join(tempDir, newFileName);
                  await downloadImage(row.imageSrc, tempPath);
                  const imageUrl = await uploadToSupabase(
                    tempPath,
                    newFileName,
                    row.mime_type || "image/jpeg",
                  );
                  updateData.image = imageUrl;
                  updateData.image_url = imageUrl;
                  fs.unlinkSync(tempPath);
                  reimagedCount++;
                }

                const { error: updateError } = await supabase
                  .from("products")
                  .update(updateData)
                  .eq("name", row.name);

                if (updateError) throw updateError;
                updatedCount++;
                process.stdout.write(`\r🔄 Actualizados: ${updatedCount} | Re-imágenes: ${reimagedCount} | Nuevos: ${addedCount}`);
              } else {
                // INSERTAR NUEVO (requiere imagen)
                console.log(`\n📦 Agregando nuevo: ${row.name}`);
                const fileName = `${row.name.replace(/[^a-zA-Z0-9]/g, "_")}.${(row.mime_type || "image/jpeg").split("/")[1] || "jpg"}`;
                const tempPath = path.join(tempDir, fileName);

                await downloadImage(row.imageSrc, tempPath);
                const imageUrl = await uploadToSupabase(
                  tempPath,
                  fileName,
                  row.mime_type || "image/jpeg",
                );

                const { error: insertError } = await supabase
                  .from("products")
                  .insert({
                    name: row.name,
                    category: row.category || "D&D",
                    price: price,
                    min_price: minPrice,
                    max_price: maxPrice,
                    image: imageUrl,
                    image_url: imageUrl,
                    designer: row.designer,
                    set_name: finalSetName,
                    mime_type: row.mime_type,
                    size: size,
                    creature_type: row.creature_type,
                    weapon: row.weapon,
                    universe: row.universe,
                    grade: hasValidGrade ? rawGrade : null,
                    description: `Miniatura de alta calidad de ${row.name}.`,
                  });

                if (insertError) throw insertError;
                fs.unlinkSync(tempPath);
                addedCount++;
              }
            } catch (err) {
              errorCount++;
              console.error(`\n❌ Error en ${row.name}:`, err.message);
            }
          }

          console.log(`\n\n🎉 Proceso completado!`);
          console.log(`✅ Nuevos agregados: ${addedCount}`);
          console.log(`🔄 Precios actualizados: ${updatedCount}`);
          console.log(`🖼️  Re-imágenes subidas: ${reimagedCount}`);
          console.log(`❌ Errores: ${errorCount}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

importProducts().catch(console.error);
