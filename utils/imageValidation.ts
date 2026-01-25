/**
 * Validates image file for security and size constraints
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 5MB)
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No se seleccionó ningún archivo' };
  }

  // Validate file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `El archivo es muy grande. Máximo permitido: ${maxSizeMB}MB` };
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato de archivo no permitido. Usa: JPG, PNG, WEBP o GIF' };
  }

  // Validate file extension (defense in depth)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { isValid: false, error: 'Extensión de archivo no válida' };
  }

  // Additional check: ensure extension matches MIME type
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const mimeToExtension: { [key: string]: string[] } = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif']
  };

  const expectedExtensions = mimeToExtension[file.type] || [];
  if (!expectedExtensions.includes(extension)) {
    return { isValid: false, error: 'El tipo de archivo no coincide con su extensión' };
  }

  return { isValid: true };
}

/**
 * Safely reads image file as Data URL after validation
 * @param file - The file to read
 * @param maxSizeMB - Maximum file size in MB
 * @returns Promise with base64 string or rejects with error
 */
export function safeReadImageAsDataURL(file: File, maxSizeMB: number = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate first
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Error al procesar la imagen'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}
