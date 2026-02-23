import express from 'express';
import {
  verifyOrderPayment,
  verifyBookingPayment,
  refundOrderPayment,
  getOrderPaymentDetails,
} from '../Controller/PaymentController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

// Verify payments (protected routes - require authentication)
router.post('/verify-order', protect, verifyOrderPayment);
router.post('/verify-booking', protect, verifyBookingPayment);

// Refund (admin only)
router.post('/refund-order/:orderId', protect, adminOnly, refundOrderPayment);

// Get payment details
router.get('/order/:orderId', protect, getOrderPaymentDetails);

export default router;
