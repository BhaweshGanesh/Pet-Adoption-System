import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Configure cloudinary with environment variables
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary credentials not found. Image upload may not work.');
  console.warn('💡 Add these to your .env file:');
  console.warn('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.warn('   CLOUDINARY_API_KEY=your_api_key');
  console.warn('   CLOUDINARY_API_SECRET=your_api_secret');
}

export default cloudinary;

