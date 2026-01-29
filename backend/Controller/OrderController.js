import Order from '../model/Ordermodel.js';
import Product from '../model/Productmodel.js';
import User from '../model/Usermodel.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name category image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (requires authentication)
export const createOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, shippingFee, totalAmount, paymentMethod, notes } = req.body;

    // Get authenticated user if available
    let userEmail = customer.email;
    let userName = customer.name;
    let userId = null;

    // If user is authenticated (token is present), use their email
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        userEmail = user.email;
        userName = user.fullName;
        userId = user._id;
      }
    }

    // Validate and calculate order
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal,
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate shipping fee (free if subtotal >= 10000)
    const FREE_SHIPPING_THRESHOLD = 10000;
    const SHIPPING_FEE = 100;
    const calculatedShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    
    // Calculate final total
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    // Use provided values or calculated values (for validation)
    const finalSubtotal = subtotal || calculatedSubtotal;
    const finalShipping = shippingFee !== undefined ? shippingFee : calculatedShipping;
    const finalTotal = totalAmount || calculatedTotal;

    // Create order instance with authenticated user email
    const order = new Order({
      customer: {
        ...customer,
        name: userName,
        email: userEmail,
      },
      user: userId, // Link to user if authenticated
      items: orderItems,
      subtotal: finalSubtotal,
      shippingFee: finalShipping,
      totalAmount: finalTotal,
      paymentMethod,
      notes,
    });

    // Save to trigger pre-save hook for orderNumber generation
    await order.save();

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(userEmail, userName, {
        orderNumber: order.orderNumber,
        items: orderItems,
        subtotal: finalSubtotal,
        shippingFee: finalShipping,
        totalAmount: finalTotal,
        paymentMethod: order.paymentMethod,
        address: customer.address,
        orderDate: order.createdAt,
      });
      console.log(`✅ Order confirmation email sent to ${userEmail}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating order',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id).populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const oldPaymentStatus = order.paymentStatus;
    const oldStatus = order.status;
    let stockRestored = false;

    // Update status and payment status first
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Auto-update payment status to "Unpaid" when order is cancelled
    if (status === 'Cancelled' && order.paymentStatus !== 'Failed') {
      order.paymentStatus = 'Unpaid';
      console.log('✅ Payment status automatically updated to "Unpaid" due to order cancellation');
    }

    // Auto-update payment status to "Refunded" when order is returned
    if (status === 'Returned' && order.paymentStatus !== 'Refunded') {
      order.paymentStatus = 'Refunded';
      console.log('✅ Payment status automatically updated to "Refunded" due to order return');
    }

    // Auto-update order status to "Cancelled" when payment is "Failed"
    if (paymentStatus === 'Failed' && order.status !== 'Cancelled') {
      order.status = 'Cancelled';
      console.log('✅ Order status automatically updated to "Cancelled" due to payment failure');
    }

    // Auto-update order status to "Returned" when payment is "Refunded"
    if (paymentStatus === 'Refunded' && order.status !== 'Returned') {
      order.status = 'Returned';
      console.log('✅ Order status automatically updated to "Returned" due to refund');
    }

    // Auto-update payment status to "Paid" when order is NEWLY delivered
    // Only if payment status wasn't explicitly changed
    if (status === 'Delivered' && oldStatus !== 'Delivered' && !paymentStatus && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      console.log('✅ Payment status automatically updated to "Paid" for delivered order');
    }

    // Restore stock for Failed, Cancelled, Refunded, or Returned orders
    const shouldRestoreStock = 
      (paymentStatus === 'Failed' && oldPaymentStatus !== 'Failed') ||
      (paymentStatus === 'Refunded' && oldPaymentStatus !== 'Refunded') ||
      (order.status === 'Cancelled' && status === 'Cancelled') ||
      (order.status === 'Returned' && status === 'Returned');

    if (shouldRestoreStock) {
      console.log('🔄 Restoring stock for order:', order.orderNumber);
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          console.log(`✅ Restored ${item.quantity} units of ${product.name}`);
        }
      }
      stockRestored = true;
    }

    await order.save();

    // Send email notification to customer
    try {
      await sendOrderStatusUpdateEmail(
        order.customer.email,
        order.customer.name,
        {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          items: order.items,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          totalAmount: order.totalAmount,
          orderDate: order.createdAt,
          stockRestored: stockRestored,
        }
      );
      console.log(`✅ Status update email sent to ${order.customer.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.status(200).json({
      success: true,
      message: `Order status updated successfully${stockRestored ? ' and stock restored' : ''}`,
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private/Admin
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message,
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message,
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message,
    });
  }
};

