import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc    Upload an image to Cloudinary
 * @param   {string} filePath - Path to the local file
 * @param   {string} folder - Cloudinary folder name
 * @returns {Promise} Cloudinary upload response
 */
export const uploadToCloudinary = async (filePath, folder = 'blog_posts') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

/**
 * @desc    Delete an image from Cloudinary
 * @param   {string} publicId - Cloudinary public ID of the image
 * @returns {Promise} Cloudinary delete response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error('Image deletion failed');
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
};
