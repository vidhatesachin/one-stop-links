import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary with optimization
 * @param base64Image Base64 encoded image string
 * @param folder Folder name in Cloudinary
 * @returns Cloudinary upload result with secure URL
 */
export const uploadToCloudinary = async (
  base64Image: string,
  folder: string = 'business-logos'
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      // Optimize image: resize to 400x400 (square for logos)
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
      ],
      // Generate multiple responsive sizes
      responsive_breakpoints: {
        create_derived: true,
        bytes_step: 20000,
        min_width: 100,
        max_width: 400,
        max_images: 3,
      },
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId Public ID of the image to delete
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw - deletion failure shouldn't block updates
  }
};

export default cloudinary;
