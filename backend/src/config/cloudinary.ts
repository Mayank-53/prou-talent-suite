import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

/**
 * Upload an image to Cloudinary
 * @param filePath - Path to the file to upload
 * @param folder - Folder to upload to (optional)
 * @returns Cloudinary upload response
 */
export const uploadImage = async (filePath: string, folder = 'employees'): Promise<any> => {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      use_filename: true,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Cloudinary deletion response
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

export default cloudinary;
