import express from 'express';
import { uploadImage, deleteImage } from '../Controller/UploadController.js';
import upload from '../Middleware/upload.js';
// import { protect, adminOnly } from '../Middleware/Auth.js'; // Uncomment when ready

const router = express.Router();

// Upload image route - single file with field name 'image'
router.post('/', upload.single('image'), uploadImage);

// Delete image route
router.delete('/:publicId', deleteImage);

export default router;

