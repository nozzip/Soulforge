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
  
  return Math.round(finalPrice);
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
      .pipe(csv())
      .on('data', async (row) => {
        results.push(row);
      })
      .on('end', async () => {
        try {
          // Filtrar productos que tienen check = "Si"
          const approvedProducts = results.filter(row => row.check && row.check.toLowerCase() === 'si');
          const skippedProducts = results.length - approvedProducts.length;
          
          console.log(`📊 Se encontraron ${results.length} productos en el CSV`);
          if (skippedProducts > 0) {
            console.log(`⏭️  ${skippedProducts} productos serán omitidos (sin check = "Si")`);
          }
          console.log(`✅ Se procesarán ${approvedProducts.length} productos aprobados`);
          
          for (let i = 0; i < approvedProducts.length; i++) {
            const row = approvedProducts[i];
            console.log(`\n📦 Procesando ${i + 1}/${approvedProducts.length}: ${row.name}`);
            
            try {
              // 1. Descargar imagen
              const fileName = `${Date.now()}_${path.basename(row.name).replace(/[^a-zA-Z0-9]/g, '_')}.${row.mimeType.split('/')[1]}`;
              const tempPath = path.join(tempDir, fileName);
              
              console.log(`   📥 Descargando imagen...`);
              await downloadImage(row.link, tempPath);
              
              // 2. Subir a Supabase Storage
              console.log(`   ☁️ Subiendo a Supabase...`);
              const imageUrl = await uploadToSupabase(tempPath, fileName, row.mimeType);
              
              // 3. Calcular precio
              const price = calculatePrice(row.grade.toUpperCase(), row.size);
              console.log(`   💰 Precio calculado: $${price} (${row.grade} - ${row.size})`);
              
              // 4. Insertar en base de datos
              console.log(`   💾 Guardando en base de datos...`);
              const { data, error } = await supabase
                .from('products')
                .insert({
                  name: row.name,
                  category: 'D&D', // Puedes ajustar esto según la imagen
                  scale: row.size,
                  price: price,
                  image: imageUrl,
                  set_name: row.setName,
                  mime_type: row.mimeType,
                  size: row.size,
                  weapon: row.weapon,
                  title: row.title,
                  grade: row.grade.toUpperCase(),
                  image_url: imageUrl,
                  description: `${row.weapon ? `Arma: ${row.weapon}. ` : ''}${row.title ? `Personaje: ${row.title}. ` : ''}Diseñado por ${row.setName}. Rareza: ${row.grade.toUpperCase()} (${row.grade === 'C' ? 'Common' : row.grade === 'R' ? 'Rare' : 'Legendary'})`
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
          
          // Limpiar directorio temporal
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          console.log('\n🎉 Importación completada!');
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