import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    logger.error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

if (validateCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: process.env.NODE_ENV === 'production'
  });

  cloudinary.api.ping()
    .then(() => logger.info('Cloudinary connected successfully'))
    .catch(err => logger.error(`Cloudinary connection failed: ${err.message}`));
} else {
  logger.warn('Cloudinary configuration incomplete. File uploads will be disabled.');
}

export default cloudinary;

