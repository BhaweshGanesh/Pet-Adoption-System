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
import { protect } from '../Middleware/Auth.js';

const router = express.Router();

// Protected routes - require authentication (must come before generic routes)
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// Admin routes (no protection for now)
router.post('/admin', createAdminBooking); // Admin booking creation
router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;

