import express from 'express';
import { uploadImage, deleteImage } from '../Controller/UploadController.js';
import upload from '../Middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('image'), uploadImage);

router.delete('/:publicId', deleteImage);

export default router;

