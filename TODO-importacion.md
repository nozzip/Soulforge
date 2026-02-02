# TODO - Importación de Productos

## Estado Actual
- ✅ Importación inicial completada (84 productos)
- ✅ Imágenes subidas a Supabase Storage
- ✅ Productos guardados en base de datos
- ⚠️ Precios de estatuillas en $0 (requieren ajuste manual)

## Tareas Pendientes

### 1. Revisión de Importación
- [ ] Verificar columnas vacías o mal mapeadas en el CSV
- [ ] Validar que todos los datos se importaron correctamente
- [ ] Identificar productos con información incompleta

### 2. Corrección de Datos
- [ ] Ajustar productos con grade inválido (actualmente todos tienen grade "C")
- [ ] Corregir precios de estatuillas (están en $0)
- [ ] Verificar campos `weapon`, `title` y otros que puedan estar vacíos

### 3. Implementación en Catálogo Actual
- [ ] Integrar productos importados con el frontend existente
- [ ] Actualizar componente de catálogo para mostrar nuevos productos
- [ ] Implementar filtros por categoría, grade, precio, etc.
- [ ] Verificar que las imágenes se carguen correctamente

### 4. Mejoras al Script de Importación
- [ ] Mejorar detección automática de productos vs estatuillas
- [ ] Implementar mejor manejo de errores y validación
- [ ] Agregar logging más detallado para debugging
- [ ] Considerar migración a TypeScript

## Notas Importantes
- Las estatuillas (productos sin size/grade válidos) necesitan precio manual
- Algunos productos pueden tener datos incompletos del CSV original
- Considerar agregar categorías específicas para diferentes tipos de productos

## Archivos Relacionados
- `import-products.cjs` - Script de importación
- `products.csv` - Archivo de datos original
- `.env.local` - Configuración de Supabase

---
*Última actualización: 29/01/2026*