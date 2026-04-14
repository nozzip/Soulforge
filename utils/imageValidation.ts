/**
 * Validates image file for security and size constraints
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 5MB)
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5,
): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: "No se seleccionó ningún archivo" };
  }

  // Validate file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo es muy grande. Máximo permitido: ${maxSizeMB}MB`,
    };
  }

  // Validate MIME type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato de archivo no permitido. Usa: JPG, PNG, WEBP o GIF",
    };
  }

  // Validate file extension (defense in depth)
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasValidExtension) {
    return { isValid: false, error: "Extensión de archivo no válida" };
  }

  // Additional check: ensure extension matches MIME type
  const extension = fileName.substring(fileName.lastIndexOf("."));
  const mimeToExtension: { [key: string]: string[] } = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
  };

  const expectedExtensions = mimeToExtension[file.type] || [];
  if (!expectedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: "El tipo de archivo no coincide con su extensión",
    };
  }

  return { isValid: true };
}

/**
 * Safely reads image file as Data URL after validation
 * @param file - The file to read
 * @param maxSizeMB - Maximum file size in MB
 * @returns Promise with base64 string or rejects with error
 */
export function safeReadImageAsDataURL(
  file: File,
  maxSizeMB: number = 5,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate first
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.isValid) {
      reject(new Error(validation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Error al procesar la imagen"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes Supabase Storage image URLs using the Image Transformation service.
 * Replaces /object/public/ with /render/image/public/ and adds resize parameters.
 * @param url - The original image URL
 * @param width - The desired width
 * @returns Optimized URL or original URL if not a Supabase Storage URL
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  width: number,
): string => {
  if (!url) return "/placeholder.jpg"; // Default placeholder

  // Check if it's a Supabase Storage URL
  // NOTE: Optimization service (/render/image/) requires a paid plan. 
  // Returning original URL by default to avoid 404 errors on free tier.
  if (url.includes("/storage/v1/object/public/")) {
    const optimizedUrl = url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    // Usamos resize=contain para no deformar y calidad 80 como estándar de oro
    return `${optimizedUrl}?width=${width}&resize=contain&quality=80&format=webp`;
  }

  return url;
};
