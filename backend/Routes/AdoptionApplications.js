import express from 'express';
import {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByEmail,
  getMyAdoptions,
} from '../Controller/AdoptionApplicationController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// Protected user routes (must be FIRST to avoid conflicts)
router.get('/my-adoptions', protect, getMyAdoptions);

// Public routes
router.post('/', submitApplication);
router.get('/user/:email', getApplicationsByEmail);

// Admin routes
router.get('/', protect, adminOnly, getAllApplications);
router.get('/:id', protect, adminOnly, getApplicationById);
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);
router.delete('/:id', protect, adminOnly, deleteApplication);

export default router;

