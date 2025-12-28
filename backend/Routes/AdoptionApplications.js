import express from 'express';
import {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByEmail,
} from '../Controller/AdoptionApplicationController.js';
// import { protect, adminOnly } from '../Middleware/Auth.js'; // Uncomment when ready

const router = express.Router();

// Public routes
router.post('/', submitApplication);
router.get('/user/:email', getApplicationsByEmail);

// Admin routes (add auth middleware when ready)
router.get('/', getAllApplications); // Add: protect, adminOnly
router.get('/:id', getApplicationById); // Add: protect, adminOnly
router.put('/:id/status', updateApplicationStatus); // Add: protect, adminOnly
router.delete('/:id', deleteApplication); // Add: protect, adminOnly

export default router;

