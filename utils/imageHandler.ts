import { supabase } from "../src/supabase";

/**
 * Uploads an image to Supabase Storage after converting it to WebP and resizing it.
 * @param file The file to upload
 * @param userId The ID of the user uploading the image (for folder structure)
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  userId: string,
): Promise<string | null> => {
  try {
    // 1. Convert/Resize to WebP
    const webpBlob = await convertToWebP(file);

    // 2. Upload to Supabase
    // Ensure unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${userId}/${timestamp}-${randomString}.webp`;

    const { data, error } = await supabase.storage
      .from("forum-images")
      .upload(fileName, webpBlob, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      // Normalize error to string to check for bucket existence
      if (
        error.message.includes("bucket not found") ||
        error.message.includes("The resource was not found")
      ) {
        console.error(
          'Please create a public bucket named "forum-images" in your Supabase project.',
        );
        alert('Error: "forum-images" bucket missing in Supabase.');
      }
      return null;
    }

    // 3. Get Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("forum-images").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  }
};

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas"); // Create raw element
      let width = img.width;
      let height = img.height;

      const MAX_WIDTH = 1920;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas to Blob failed"));
          }
        },
        "image/webp",
        0.8,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
