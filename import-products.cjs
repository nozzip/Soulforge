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
    Small: 4,
    Medium: 4.5,
    Large: 7.5,
    Huge: 22.5,
    Gargantuan: 50,
  };

  const gradeMultipliers = {
    C: 1, // Común
    R: 2, // Raro
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
    .upload(`imports/${fileName}`, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(`imports/${fileName}`);

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
            "name",
            "category",
            "designer",
            "set_name",
            "mime_type",
            "size",
            "creature_type",
            "weapon",
            "title",
            "grade",
            "approved",
          ],
        }),
      )
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        try {
          // Filtrar por aprobado. Detectar si hay columna extra en _13 (14 cols vs 13 cols)
          const approvedProducts = results.filter((row) => {
            const isApproved =
              (row.approved && row.approved.trim().toLowerCase() === "si") ||
              (row._13 && row._13.trim().toLowerCase() === "si");
            return isApproved;
          });

          console.log(
            `📊 Se encontraron ${results.length} productos en el CSV`,
          );
          console.log(
            `✅ Se procesarán ${approvedProducts.length} productos aprobados`,
          );

          const { data: existingProducts } = await supabase
            .from("products")
            .select("name");

          const existingNames = new Set(
            (existingProducts || []).map((p) => p.name),
          );

          let addedCount = 0;
          let skippedExisting = 0;

          for (let i = 0; i < approvedProducts.length; i++) {
            const rawRow = approvedProducts[i];

            // Detectar desplazamiento si hay 14 columnas (vía _13)
            const isShifted = !!rawRow._13;

            const row = {
              id: rawRow.id,
              imageSrc: rawRow.imageSrc,
              name: isShifted ? rawRow.category : rawRow.name,
              category: isShifted ? rawRow.designer : rawRow.category,
              designer: isShifted ? rawRow.set_name : rawRow.designer,
              set_name: isShifted ? rawRow.mime_type : rawRow.set_name,
              mime_type: isShifted ? rawRow.size : rawRow.mime_type,
              size: isShifted ? rawRow.creature_type : rawRow.size,
              creature_type: isShifted ? rawRow.weapon : rawRow.creature_type,
              weapon: isShifted ? rawRow.title : rawRow.weapon,
              title: isShifted ? rawRow.grade : rawRow.title,
              grade: isShifted ? rawRow.approved : rawRow.grade,
              approved: isShifted ? rawRow._13 : rawRow.approved,
            };

            if (!row.name || existingNames.has(row.name)) {
              skippedExisting++;
              continue;
            }

            console.log(
              `\n📦 Procesando ${i + 1}/${approvedProducts.length}: ${row.name}`,
            );

            try {
              const fileName = `${Date.now()}_${row.name.replace(/[^a-zA-Z0-9]/g, "_")}.${(row.mime_type || "image/jpeg").split("/")[1] || "jpg"}`;
              const tempPath = path.join(tempDir, fileName);

              await downloadImage(row.imageSrc, tempPath);
              const imageUrl = await uploadToSupabase(
                tempPath,
                fileName,
                row.mime_type || "image/jpeg",
              );

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

              const { error: insertError } = await supabase
                .from("products")
                .insert({
                  name: row.name,
                  category: row.category || "D&D",
                  price: price,
                  min_price: minPrice,
                  max_price: maxPrice,
                  image: imageUrl, // Columna obligatoria
                  image_url: imageUrl,
                  designer: row.designer,
                  set_name: row.set_name,
                  mime_type: row.mime_type,
                  size: size,
                  creature_type: row.creature_type,
                  weapon: row.weapon,
                  title: row.title,
                  grade: hasValidGrade ? rawGrade : null,
                  description: `Miniatura de alta calidad de ${row.name}.`,
                });

              if (insertError) throw insertError;
              fs.unlinkSync(tempPath);
              addedCount++;
            } catch (err) {
              console.error(`❌ Error procesando ${row.name}:`, err.message);
            }
          }

          console.log(`\n🎉 Importación completada!`);
          console.log(`✅ Nuevos agregados: ${addedCount}`);
          console.log(`⏭️ Existentes omitidos: ${skippedExisting}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

importProducts().catch(console.error);
