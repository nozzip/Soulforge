const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const path = require('path');

// Configuración de Supabase
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitarás esta key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.log('Add to .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para calcular precio basado en grade y size
function calculatePrice(grade, size) {
  // Valores base por tamaño (costo de resina)
  const baseCost = {
    'Small': 1000,
    'Medium': 1400,
    'Large': 2400,
    'Huge': 7000,
    'Gargantuan': 12000
  };

  // Gastos operativos (50% del valor base)
  const overheadCost = baseCost[size] * 0.5;

  // Costo total antes del multiplicador de grade
  const totalCost = baseCost[size] + overheadCost;

  // Multiplicadores por grade (rareza)
  const gradeMultiplier = {
    'C': 1.1,   // Common
    'R': 2.0,   // Rare
    'L': 4.0    // Legendary
  };

  const finalPrice = totalCost * (gradeMultiplier[grade] || 1.0);

  // Convertir a GP (1 GP = 1000 ARS)
  return Math.round(finalPrice / 1000);
}

// Función para descargar imagen
async function downloadImage(url, filename) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filename);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    throw error;
  }
}

// Función para subir imagen a Supabase Storage
async function uploadToSupabase(filePath, fileName, mimeType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
    throw error;
  }
}

// Función principal de importación
async function importProducts() {
  const results = [];
  const tempDir = './temp_images';

  // Crear directorio temporal
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  console.log('🚀 Iniciando importación de productos...');

  // Leer CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream('./products.csv')
      .pipe(csv({
        separator: ';',
        headers: ['id', 'link', 'image_label', 'name', 'designer', 'set_name', 'mime_type', 'size', 'creature_type', 'weapon', 'title', 'grade', 'approved']
      }))
      .on('data', async (row) => {
        results.push(row);
      })
      .on('end', async () => {
        try {
          // Filtrar productos que tienen approved = "Si"
          const approvedProducts = results.filter(row => row.approved && row.approved.toLowerCase() === 'si');
          const skippedProducts = results.length - approvedProducts.length;

          console.log(`📊 Se encontraron ${results.length} productos en el CSV`);
          if (skippedProducts > 0) {
            console.log(`⏭️  ${skippedProducts} productos serán omitidos (sin approved = "Si")`);
          }
          console.log(`✅ Se procesarán ${approvedProducts.length} productos aprobados`);

          // 0. Obtener productos existentes para evitar redundancia
          console.log('\n🔍 Verificando estado actual en la base de datos...');
          const { data: existingProducts, error: fetchError } = await supabase
            .from('products')
            .select('name');

          if (fetchError) {
            console.error('   ❌ Error al consultar productos existentes:', fetchError.message);
            // No detenemos el proceso, pero asumimos que no hay nada
          }

          const existingNames = new Set((existingProducts || []).map(p => p.name));
          console.log(`   💡 Ya existen ${existingNames.size} productos en la base de datos.`);

          // Mapeo de tamaños del CSV a nombres completos para calculatePrice
          const sizeMapping = {
            'S': 'Small',
            'M': 'Medium',
            'L': 'Large',
            'H': 'Huge',
            'G': 'Gargantuan'
          };

          // Array para guardar los nombres de los productos procesados en este lote para limpieza de huérfanos
          const processedNames = [];

          for (let i = 0; i < approvedProducts.length; i++) {
            const row = approvedProducts[i];
            processedNames.push(row.name);

            // 1. Saltar si ya existe
            if (existingNames.has(row.name)) {
              console.log(`⏭️  Saltando ${i + 1}/${approvedProducts.length}: ${row.name} (Ya existe)`);
              continue;
            }

            console.log(`\n📦 Procesando ${i + 1}/${approvedProducts.length}: ${row.name}`);

            try {
              // 1. Descargar imagen
              const fileName = `${Date.now()}_${path.basename(row.name).replace(/[^a-zA-Z0-9]/g, '_')}.${(row.mime_type || 'image/jpeg').split('/')[1]}`;
              const tempPath = path.join(tempDir, fileName);

              console.log(`   📥 Descargando imagen...`);
              await downloadImage(row.link, tempPath);

              // 2. Subir a Supabase Storage
              console.log(`   ☁️ Subiendo a Supabase...`);
              const imageUrl = await uploadToSupabase(tempPath, fileName, row.mime_type || 'image/jpeg');

              // 3. Calcular precio
              const rawGrade = (row.grade || '').trim().toUpperCase();
              const rawSize = (row.size || '').trim().toUpperCase();

              const validGrades = ['C', 'R', 'L'];
              const hasValidGrade = validGrades.includes(rawGrade);

              let size = '';
              let price = 0;

              // Lógica de tamaño: si tiene '/' es Medium, si no mapear S/M/L/H/G
              if (rawSize.includes('/')) {
                size = 'Medium';
              } else if (rawSize) {
                size = sizeMapping[rawSize] || 'Medium';
              }

              const hasValidSize = size !== '';

              if (hasValidGrade && hasValidSize && !rawSize.includes('/')) {
                // calculatePrice(grade, size)
                price = calculatePrice(rawGrade, size);
                console.log(`   💰 Precio calculado: ${price} GP (${rawGrade} - ${size})`);
              } else {
                price = 0;
                console.log(`   💰 Producto manual: $0 (Grade: ${rawGrade || 'faltante'}, Size: ${rawSize || 'faltante'}${rawSize.includes('/') ? ' - Ambiguo' : ''})`);
              }

              // 4. Insertar en base de datos
              console.log(`   💾 Guardando en base de datos...`);
              const { data, error } = await supabase
                .from('products')
                .insert({
                  name: row.name,
                  category: 'D&D',
                  price: price,
                  image: imageUrl,
                  designer: row.designer,
                  set_name: row.set_name,
                  mime_type: row.mime_type,
                  size: size || null, // Guardar NULL si está vacío
                  creature_type: row.creature_type,
                  weapon: row.weapon || null, // Guardar NULL si está vacío
                  title: row.title || '',
                  grade: hasValidGrade ? rawGrade : 'C',
                  image_url: imageUrl,
                  description: `${row.title ? `Personaje: ${row.title}. ` : ''}Diseñado por ${row.designer}. Set: ${row.set_name}. Rareza: ${hasValidGrade ? rawGrade : 'C'} (${hasValidGrade ? (rawGrade === 'C' ? 'Common' : rawGrade === 'R' ? 'Rare' : 'Legendary') : 'Common - Estatuilla'})`
                })
                .select();

              if (error) throw error;

              // 5. Limpiar archivo temporal
              fs.unlinkSync(tempPath);

              console.log(`   ✅ Producto guardado con ID: ${data[0].id}`);

            } catch (error) {
              console.error(`   ❌ Error procesando ${row.name}:`, error.message);
            }
          }

          // 6. Limpiar productos huérfanos (los que están en DB pero no en el CSV de hoy)
          // Solo limpiamos si el CSV no está vacío para evitar borrar todo por error
          if (processedNames.length > 0) {
            console.log('\n🧹 Iniciando limpieza de productos huérfanos...');
            // Paginar la limpieza si hay muchos nombres (Supabase IN limit)
            // Para 84-100 productos funciona directo. Para 10k habría que paginar.
            const { error: deleteError } = await supabase
              .from('products')
              .delete()
              .not('name', 'in', `(${processedNames.map(n => `"${n.replace(/"/g, '""')}"`).join(',')})`);

            if (deleteError) {
              console.error('   ❌ Error limpiando huerfanos:', deleteError.message);
            } else {
              console.log('   ✅ Archivos sincronizados exitosamente.');
            }
          }

          // Limpiar directorio temporal
          fs.rmSync(tempDir, { recursive: true, force: true });

          console.log('\n🎉 Importación completada!');
          console.log(`✅ Total productos procesados: ${approvedProducts.length}`);
          resolve();

        } catch (error) {
          console.error('❌ Error en la importación:', error.message);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Ejecutar importación
importProducts()
  .then(() => {
    console.log('✅ Proceso finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  });