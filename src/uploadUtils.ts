import { supabase } from './supabase';

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Interfaz para resultado de upload
export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Interfaz para validación
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida un archivo antes de subirlo (client-side)
 * - Verifica tipo MIME
 * - Verifica tamaño
 * - Verifica extensión
 * - Detecta magic bytes (básico)
 */
export function validateFile(file: File): ValidationResult {
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten: JPG, PNG, WEBP`
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo permitido: 10MB`
    };
  }

  // Validar extensión
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida: ${extension}. Solo se permiten: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Validar nombre de archivo (prevenir path traversal)
  if (file.name.includes('/') || file.name.includes('\\') || file.name.includes('..')) {
    return {
      valid: false,
      error: 'Nombre de archivo inválido'
    };
  }

  return { valid: true };
}

/**
 * Lee los primeros bytes del archivo para validación adicional (magic bytes)
 */
function validateMagicBytes(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target?.result as ArrayBuffer).slice(0, 4);
      
      // Magic bytes para formatos comunes
      const signatures: { [key: string]: number[] } = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
      };

      const signature = signatures[file.type];
      if (signature) {
        const matches = signature.every((byte, i) => bytes[i] === byte);
        if (!matches) {
          resolve({
            valid: false,
            error: `El archivo no coincide con el tipo declarado: ${file.type}`
          });
          return;
        }
      }

      resolve({ valid: true });
    };
    reader.onerror = () => {
      resolve({ valid: false, error: 'Error al leer el archivo' });
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

/**
 * Sanitiza el nombre de archivo
 */
function sanitizeFilename(filename: string): string {
  // Remover caracteres especiales y path traversal
  let sanitized = filename
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limitar longitud
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop() || '';
    sanitized = sanitized.substring(0, 96) + '.' + ext;
  }
  
  return sanitized;
}

/**
 * Genera un nombre de archivo único y seguro
 */
function generateSecureFilename(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const sanitized = sanitizeFilename(originalName);
  const extension = sanitized.split('.').pop() || 'jpg';
  
  // Estructura: userId/timestamp-random.extension
  return `${userId}/${timestamp}-${random}.${extension}`;
}

/**
 * Sube un archivo de forma segura a Supabase Storage
 * Incluye todas las validaciones client-side
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // 1. Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para subir imágenes' };
    }

    // 2. Validaciones client-side
    const basicValidation = validateFile(file);
    if (!basicValidation.valid) {
      return { success: false, error: basicValidation.error };
    }

    // 3. Validar magic bytes (verificación extra de tipo real)
    const magicValidation = await validateMagicBytes(file);
    if (!magicValidation.valid) {
      return { success: false, error: magicValidation.error };
    }

    // 4. Generar nombre seguro
    const filePath = generateSecureFilename(file.name, user.id);

    // 5. Subir archivo
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      // Manejar errores específicos
      if (error.message?.includes('row-level security')) {
        return { success: false, error: 'No tienes permiso para subir archivos (Rate limit excedido)' };
      }
      throw error;
    }

    // 6. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path
    };

  } catch (error: any) {
    console.error('Error en uploadImage:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al subir imagen'
    };
  }
}

/**
 * Elimina una imagen del storage
 * Verifica que el usuario sea el dueño
 */
export async function deleteImage(filePath: string): Promise<UploadResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para eliminar imágenes' };
    }

    // Verificar que el archivo pertenece al usuario
    if (!filePath.startsWith(`${user.id}/`)) {
      return { success: false, error: 'No tienes permiso para eliminar esta imagen' };
    }

    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al eliminar imagen'
    };
  }
}

/**
 * Verifica el estado del rate limit del usuario
 */
export async function checkRateLimitStatus(): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: false, remaining: 0, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('upload_rate_limits')
      .select('upload_count, window_start')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    const maxUploads = 10;
    const windowHours = 1;

    if (!data) {
      return { allowed: true, remaining: maxUploads };
    }

    const windowStart = new Date(data.window_start);
    const resetTime = new Date(windowStart.getTime() + windowHours * 60 * 60 * 1000);
    const remaining = Math.max(0, maxUploads - data.upload_count);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime
    };
  } catch (error: any) {
    return {
      allowed: false,
      remaining: 0,
      error: error.message
    };
  }
}
