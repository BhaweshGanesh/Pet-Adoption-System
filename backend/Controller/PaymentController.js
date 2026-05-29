import axios from 'axios';
import Order from '../model/Ordermodel.js';
import HostelBooking from '../model/HostelBookingmodel.js';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const testKhaltiKey = async (req, res) => {
  try {
    const maskedKey = KHALTI_SECRET_KEY
      ? `${KHALTI_SECRET_KEY.substring(0, 20)}...`
      : 'NOT SET';
    console.log(`🔑 Testing Khalti key: ${maskedKey}`);
    console.log(`🌐 Khalti base URL: ${KHALTI_BASE_URL}`);

    const testPayload = {
      return_url: 'http://localhost:5173/payment-callback?type=order&orderId=test',
      website_url: 'http://localhost:5173',
      amount: 1000,
      purchase_order_id: 'test-order-001',
      purchase_order_name: 'Test Order',
    };

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      testPayload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.json({
      success: true,
      message: 'Khalti key is valid!',
      keyPrefix: maskedKey,
      baseUrl: KHALTI_BASE_URL,
      khaltiResponse: response.data,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: 'Khalti key test failed',
      keyPrefix: KHALTI_SECRET_KEY ? `${KHALTI_SECRET_KEY.substring(0, 20)}...` : 'NOT SET',
      baseUrl: KHALTI_BASE_URL,
      khaltiError: error.response?.data || error.message,
    });
  }
};

export const initiateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const returnUrl = `${FRONTEND_URL}/payment-callback?type=order&orderId=${orderId}`;

    const payload = {
      return_url: returnUrl,
      website_url: FRONTEND_URL,
      amount: Math.round(order.totalAmount * 100),
      purchase_order_id: orderId,
      purchase_order_name: `Order ${order.orderNumber}`,
      customer_info: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
    };

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    order.khaltiPayment = {
      ...(order.khaltiPayment || {}),
      pidx: khaltiResponse.data.pidx,
    };
    await order.save();

    console.log(`✅ Khalti payment initiated for order ${order.orderNumber}, pidx: ${khaltiResponse.data.pidx}`);

    return res.status(200).json({
      success: true,
      data: {
        pidx: khaltiResponse.data.pidx,
        payment_url: khaltiResponse.data.payment_url,
        expires_at: khaltiResponse.data.expires_at,
      },
    });
  } catch (error) {
    const khaltiError = error.response?.data;
    console.error('❌ Khalti initiate error:', khaltiError || error.message);
    return res.status(500).json({
      success: false,
      message: khaltiError
        ? `Khalti error: ${JSON.stringify(khaltiError)}`
        : `Failed to initiate payment: ${error.message}`,
    });
  }
};

export const initiateBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await HostelBooking.findById(bookingId).populate('room', 'roomNumber roomType');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const returnUrl = `${FRONTEND_URL}/payment-callback?type=booking&bookingId=${bookingId}`;

    const payload = {
      return_url: returnUrl,
      website_url: FRONTEND_URL,
      amount: Math.round(booking.totalAmount * 100),
      purchase_order_id: bookingId,
      purchase_order_name: `Hostel Booking ${booking.bookingNumber}`,
      customer_info: {
        name: booking.petDetails?.petName || 'Pet Owner',
        email: booking.contactInfo.email,
        phone: booking.contactInfo.phone,
      },
    };

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    booking.khaltiPayment = {
      ...(booking.khaltiPayment || {}),
      pidx: khaltiResponse.data.pidx,
    };
    await booking.save();

    console.log(`✅ Khalti payment initiated for booking ${booking.bookingNumber}, pidx: ${khaltiResponse.data.pidx}`);

    return res.status(200).json({
      success: true,
      data: {
        pidx: khaltiResponse.data.pidx,
        payment_url: khaltiResponse.data.payment_url,
        expires_at: khaltiResponse.data.expires_at,
      },
    });
  } catch (error) {
    const khaltiError = error.response?.data;
    console.error('❌ Khalti initiate error:', khaltiError || error.message);
    return res.status(500).json({
      success: false,
      message: khaltiError
        ? `Khalti error: ${JSON.stringify(khaltiError)}`
        : `Failed to initiate payment: ${error.message}`,
    });
  }
};

export const verifyOrderPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;

    if (!pidx || !orderId) {
      return res.status(400).json({ success: false, message: 'pidx and orderId are required' });
    }

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = khaltiResponse.data;

    if (paymentData.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentData.status}`,
        status: paymentData.status,
      });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: { order },
      });
    }

    for (const item of order.items) {
      const product = item.product;
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
        console.log(`✅ Reduced stock for ${product.name}: -${item.quantity} (New stock: ${product.stock})`);
      }
    }

    order.paymentStatus = 'Paid';
    order.paymentMethod = 'Khalti';
    order.khaltiPayment = {
      pidx: paymentData.pidx,
      transactionId: paymentData.transaction_id,
      amount: paymentData.total_amount,
      verifiedAt: new Date(),
    };

    await order.save();

    console.log(`✅ Khalti payment verified for order ${order.orderNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { order, payment: paymentData },
    });
  } catch (error) {
    console.error('❌ Khalti payment verification error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message,
    });
  }
};

export const verifyBookingPayment = async (req, res) => {
  try {
    const { pidx, bookingId } = req.body;

    if (!pidx || !bookingId) {
      return res.status(400).json({ success: false, message: 'pidx and bookingId are required' });
    }

    const booking = await HostelBooking.findById(bookingId).populate('room', 'roomNumber roomType');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = khaltiResponse.data;

    if (paymentData.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentData.status}`,
        status: paymentData.status,
      });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: { booking },
      });
    }

    booking.paymentStatus = 'Paid';
    booking.paymentMethod = 'Khalti';
    booking.status = 'Confirmed';
    booking.khaltiPayment = {
      pidx: paymentData.pidx,
      transactionId: paymentData.transaction_id,
      amount: paymentData.total_amount,
      verifiedAt: new Date(),
    };

    await booking.save();

    console.log(`✅ Khalti payment verified for booking ${booking.bookingNumber}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { booking, payment: paymentData },
    });
  } catch (error) {
    console.error('❌ Khalti payment verification error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message,
    });
  }
};

export const getOrderPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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

export const refundOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentMethod !== 'Khalti' || !order.khaltiPayment?.pidx) {
      return res.status(400).json({ success: false, message: 'This order was not paid via Khalti' });
    }

    order.paymentStatus = 'Refunded';
    await order.save();

    console.log(`⚠️ Refund requested for order ${order.orderNumber}. Process manually in Khalti dashboard.`);

    return res.status(200).json({
      success: true,
      message: 'Refund initiated. Please process manually in Khalti merchant dashboard.',
      data: {
        order,
        khaltiPidx: order.khaltiPayment.pidx,
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
