# 📦 Importador de Productos - ResinForge

## 🚀 Guía Rápida

### 1. Prepara tu Excel
1. Exporta tu Excel como **CSV** con exactamente estas columnas:
   ```
   link,name,setName,mimeType,size,weapon,title,grade,check
   ```
2. Nombra el archivo `products.csv` y colócalo en la raíz del proyecto
3. **Importante**: Solo se procesarán productos donde `check = "Si"`

### 2. Configura Supabase
Ejecuta este SQL en tu proyecto Supabase:
```sql
-- Ver contenido en database-setup.sql
```

### 3. Configura Variables de Entorno
En tu archivo `.env.local`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # 🔑 IMPORTANTE!
```

> Para obtener la SERVICE_ROLE_KEY ve a: Supabase Dashboard → Settings → API → service_role (secret)

### 4. Instala Dependencias
```bash
npm install @supabase/supabase-js axios csv-parser dotenv
```

### 5. Ejecuta la Importación
```bash
node import-products.cjs
```

## 📊 Sistema de Pricing Automático

El precio se calcula automáticamente con esta fórmula:
```
Precio = Base ($500) × MultiplicadorTamaño × MultiplicadorGrado
```

### Sistema de Pricing:

**Paso 1: Costo Base (Resina)**
- Small: $1.000
- Medium: $1.400
- Large: $2.400
- Huge: $7.000
- Gargantuan: $12.000

**Paso 2: Gastos Operativos**
- Se suma el 50% del costo base

**Paso 3: Multiplicador por Rareza**
- Common (C): × 1.1 del total
- Rare (R): × 2.0 del total
- Legendary (L): × 4.0 del total

### Ejemplos:
- **Common Medium**: ($1.400 + $700) × 1.1 = **$2.310**
- **Rare Large**: ($2.400 + $1.200) × 2.0 = **$7.200**
- **Legendary Huge**: ($7.000 + $3.500) × 4.0 = **$42.000**

## 🔧 Características

✅ **Descarga automática** de imágenes desde Google Drive  
✅ **Subida a Supabase Storage** con URLs públicas  
✅ **Generación automática** de descripciones  
✅ **Cálculo de precios** basado en grade y size  
✅ **Manejo de errores** con logging detallado  
✅ **Limpieza automática** de archivos temporales  

## 📝 Ejemplo de CSV

```csv
link,name,setName,mimeType,size,weapon,title,grade,check
https://drive.google.com/uc?id=123,Guerrero Élfico,ArturoMinis,image/jpeg,Medium,Arco Largo,Legolas Verde,R,Si
https://drive.google.com/uc?id=456,Dragón Rojo,DragonForge,image/png,Huge,Fuego,Alduin el Devorador,L,Si
https://drive.google.com/uc?id=789,Goblin Común,CheapMinis,image/gif,Small,Daga,Goblin Sanguinario,C,No
```
> **Nota**: El tercer producto no se importará porque `check = "No"`

## ⚠️ Notas Importantes

1. **Permisos de Google Drive**: Asegúrate que los links sean públicos
2. **SERVICE_ROLE_KEY**: Necesitarás permisos de administrador en Supabase
3. **RLE**: Las políticas de storage deben estar configuradas correctamente
4. **Backup**: Haz backup de tu base de datos antes de la importación

## 🐛 Solución de Problemas

### Error: "Missing Supabase credentials"
- Verifica que tienes todas las variables en `.env.local`
- Reinicia tu terminal/editor después de agregar las variables

### Error: "Permission denied"
- Usa la SERVICE_ROLE_KEY (no la anon key)
- Verifica las políticas RLS en Supabase Storage

### Error: "File too large"
- El límite está configurado a 10MB
- Ajusta el `file_size_limit` en el SQL si necesitas más

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del script (muestra errores específicos)
2. La consola de Supabase para permisos
3. Que los links de Google Drive sean accesibles públicamente