import express from 'express';
import {
  getAllBookings,
  getMyBookings,
  getBooking,
  createBooking,
  createAdminBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
} from '../Controller/HostelBookingController.js';
import { protect, adminOnly, staffOrAdmin, logStaffAction } from '../Middleware/Auth.js';

const router = express.Router();

// User routes require authentication 
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// Staff and Admin routes hostel management
router.get('/', protect, staffOrAdmin, logStaffAction, getAllBookings);
router.get('/:id', protect, staffOrAdmin, getBooking);
router.patch('/:id/status', protect, staffOrAdmin, logStaffAction, updateBookingStatus);

// Admin only routes
router.post('/admin', protect, adminOnly, createAdminBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
