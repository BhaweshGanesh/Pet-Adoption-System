import axios from 'axios';
import Order from '../model/Ordermodel.js';
import HostelBooking from '../model/HostelBookingmodel.js';
import Product from '../model/Productmodel.js';

// Khalti API Configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_VERIFY_URL = 'https://khalti.com/api/v2/payment/verify/';

// @desc    Verify Khalti payment for Order
// @route   POST /api/payments/verify-order
// @access  Private
export const verifyOrderPayment = async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;

    if (!token || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Token, amount, and orderId are required',
      });
    }

    // Find the order
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify payment with Khalti
    const khaltiResponse = await axios.post(
      KHALTI_VERIFY_URL,
      {
        token,
        amount, // Amount in paisa
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
        },
      }
    );

    if (khaltiResponse.data) {
      const paymentData = khaltiResponse.data;

      // Reduce stock for each item in the order (now that payment is confirmed)
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
          console.log(`✅ Reduced stock for ${product.name}: -${item.quantity} (New stock: ${product.stock})`);
        }
      }

      // Update order with payment info
      order.paymentMethod = 'Khalti';
      order.paymentStatus = 'Paid';
      order.khaltiPayment = {
        idx: paymentData.idx,
        token: token,
        amount: paymentData.amount,
        mobile: paymentData.mobile || '',
        productIdentity: paymentData.product_identity || order.orderNumber,
        productName: paymentData.product_name || 'Pet Shop Order',
        verifiedAt: new Date(),
      };

      await order.save();

      console.log(`✅ Khalti payment verified for order ${order.orderNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order: order,
          payment: paymentData,
        },
      });
    }
  } catch (error) {
    console.error('❌ Khalti payment verification error:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data?.detail || error.message,
    });
  }
};

// @desc    Verify Khalti payment for Hostel Booking
// @route   POST /api/payments/verify-booking
// @access  Private
export const verifyBookingPayment = async (req, res) => {
  try {
    const { token, amount, bookingId } = req.body;

    if (!token || !amount || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Token, amount, and bookingId are required',
      });
    }

    // Find the booking
    const booking = await HostelBooking.findById(bookingId).populate('room', 'roomNumber roomType');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Verify payment with Khalti
    const khaltiResponse = await axios.post(
      KHALTI_VERIFY_URL,
      {
        token,
        amount, // Amount in paisa
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
        },
      }
    );

    if (khaltiResponse.data) {
      const paymentData = khaltiResponse.data;

      // Update booking with payment info
      booking.paymentMethod = 'Khalti';
      booking.paymentStatus = 'Paid';
      booking.status = 'Confirmed'; // Auto-confirm on payment
      booking.khaltiPayment = {
        idx: paymentData.idx,
        token: token,
        amount: paymentData.amount,
        mobile: paymentData.mobile || '',
        productIdentity: paymentData.product_identity || booking.bookingNumber,
        productName: paymentData.product_name || `Hostel Room - ${booking.room.roomNumber}`,
        verifiedAt: new Date(),
      };

      await booking.save();

      console.log(`✅ Khalti payment verified for booking ${booking.bookingNumber}`);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          booking: booking,
          payment: paymentData,
        },
      });
    }
  } catch (error) {
    console.error('❌ Khalti payment verification error:', error.response?.data || error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data?.detail || error.message,
    });
  }
};

// @desc    Initiate refund for Order (admin only)
// @route   POST /api/payments/refund-order/:orderId
// @access  Private/Admin
export const refundOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount } = req.body; // Amount in paisa

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentMethod !== 'Khalti' || !order.khaltiPayment.idx) {
      return res.status(400).json({
        success: false,
        message: 'This order was not paid via Khalti',
      });
    }

    // Note: Khalti doesn't have automated refund API
    // Refunds need to be processed manually through Khalti merchant dashboard
    // This endpoint marks the order as refund requested
    
    order.paymentStatus = 'Refunded';
    await order.save();

    console.log(`⚠️ Refund requested for order ${order.orderNumber}. Process manually in Khalti dashboard.`);

    return res.status(200).json({
      success: true,
      message: 'Refund initiated. Please process manually in Khalti merchant dashboard.',
      data: {
        order: order,
        khaltiPaymentIdx: order.khaltiPayment.idx,
      },
    });
  } catch (error) {
    console.error('❌ Refund error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
      error: error.message,
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/order/:orderId
// @access  Private
export const getOrderPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        khaltiPayment: order.khaltiPayment,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};
