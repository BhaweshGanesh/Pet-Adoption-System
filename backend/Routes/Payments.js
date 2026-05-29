import express from 'express';
import {
  testKhaltiKey,
  initiateOrderPayment,
  initiateBookingPayment,
  verifyOrderPayment,
  verifyBookingPayment,
  refundOrderPayment,
  getOrderPaymentDetails,
} from '../Controller/PaymentController.js';
import { protect, adminOnly } from '../Middleware/Auth.js';

const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
  router.get('/test-key', testKhaltiKey);
}

router.post('/initiate-order', protect, initiateOrderPayment);
router.post('/initiate-booking', protect, initiateBookingPayment);

router.post('/verify-order', protect, verifyOrderPayment);
router.post('/verify-booking', protect, verifyBookingPayment);

router.post('/refund-order/:orderId', protect, adminOnly, refundOrderPayment);

router.get('/order/:orderId', protect, getOrderPaymentDetails);

export default router;
