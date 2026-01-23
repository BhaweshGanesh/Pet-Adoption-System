import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  resetStaffPassword,
} from '../Controller/StaffController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// All staff management routes require admin authentication
router.use(protect, adminOnly);

// Staff CRUD routes
router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

// Staff status management
router.patch('/:id/status', toggleStaffStatus);
router.patch('/:id/reset-password', resetStaffPassword);

export default router;
