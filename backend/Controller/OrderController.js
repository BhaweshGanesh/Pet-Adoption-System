import Order from '../model/Ordermodel.js';
import Product from '../model/Productmodel.js';
import User from '../model/Usermodel.js';
import HostelBooking from '../model/HostelBookingmodel.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js';

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name category image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your orders',
      error: error.message,
    });
  }
};

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

export const createOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, shippingFee, totalAmount, paymentMethod, notes } = req.body;

    let userEmail = customer.email;
    let userName = customer.name;
    let userId = null;

    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        userEmail = user.email;
        userName = user.fullName;
        userId = user._id;
      }
    }

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

      if (paymentMethod === 'Cash on Delivery') {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const FREE_SHIPPING_THRESHOLD = 10000;
    const SHIPPING_FEE = 100;
    const calculatedShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    const finalSubtotal = subtotal || calculatedSubtotal;
    const finalShipping = shippingFee !== undefined ? shippingFee : calculatedShipping;
    const finalTotal = totalAmount || calculatedTotal;

    const order = new Order({
      customer: {
        ...customer,
        name: userName,
        email: userEmail,
      },
      user: userId,
      items: orderItems,
      subtotal: finalSubtotal,
      shippingFee: finalShipping,
      totalAmount: finalTotal,
      paymentMethod,
      notes,
    });

    await order.save();

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

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (status === 'Cancelled' && order.paymentStatus !== 'Failed') {
      order.paymentStatus = 'Unpaid';
      console.log('✅ Payment status automatically updated to "Unpaid" due to order cancellation');
    }

    if (status === 'Returned' && order.paymentStatus !== 'Refunded') {
      order.paymentStatus = 'Refunded';
      console.log('✅ Payment status automatically updated to "Refunded" due to order return');
    }

    if (paymentStatus === 'Failed' && order.status !== 'Cancelled') {
      order.status = 'Cancelled';
      console.log('✅ Order status automatically updated to "Cancelled" due to payment failure');
    }

    if (paymentStatus === 'Refunded' && order.status !== 'Returned') {
      order.status = 'Returned';
      console.log('✅ Order status automatically updated to "Returned" due to refund');
    }

    if (status === 'Delivered' && oldStatus !== 'Delivered' && !paymentStatus && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      console.log('✅ Payment status automatically updated to "Paid" for delivered order');
    }

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

export const getMonthlyRevenueBreakdown = async (req, res) => {
  try {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);

    if (
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year',
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const successfulOrders = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate },
      status: { $in: ['Delivered', 'Completed', 'Successful'] },
      paymentStatus: { $in: ['Paid', 'Completed', 'Successful'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const successfulBookings = await HostelBooking.find({
      createdAt: { $gte: startDate, $lt: endDate },
      status: { $in: ['Confirmed', 'Checked-In', 'Checked-Out', 'Completed', 'Successful'] },
      paymentStatus: 'Paid',
    })
      .populate('room', 'roomName roomNumber')
      .sort({ createdAt: -1 })
      .lean();

    const successfulOrderProductIds = [
      ...new Set(
        successfulOrders.flatMap((order) =>
          (order.items || [])
            .map((item) => item.product?.toString?.())
            .filter(Boolean)
        )
      ),
    ];
    const existingProducts = await Product.find({
      _id: { $in: successfulOrderProductIds },
    })
      .select('_id name')
      .lean();
    const existingProductIdSet = new Set(
      existingProducts.map((p) => p._id.toString())
    );
    const productNameById = new Map(
      existingProducts.map((p) => [p._id.toString(), p.name])
    );

    const orders = successfulOrders.flatMap((order) =>
      (order.items || [])
        .filter((item) => {
          const pid = item.product?.toString?.();
          return pid && existingProductIdSet.has(pid);
        })
        .map((item) => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          productName:
            productNameById.get(item.product.toString()) || item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          date: order.createdAt,
        }))
    );

    const bookings = successfulBookings.map((booking) => ({
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      roomName: booking.room?.roomName || 'Room',
      roomNumber: booking.room?.roomNumber || '',
      petName: booking.petDetails?.petName || '',
      amount: booking.totalAmount || 0,
      status: booking.status,
      date: booking.createdAt,
    }));

    const orderRevenue = orders.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    const bookingRevenue = successfulBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        orderCount: successfulOrders.length,
        bookingCount: successfulBookings.length,
        orderRevenue,
        bookingRevenue,
        totalRevenue: orderRevenue + bookingRevenue,
        orders,
        bookings,
      },
    });
  } catch (error) {
    console.error('Error fetching monthly revenue breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly revenue breakdown',
      error: error.message,
    });
  }
};

export const getProductSales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $match: {
          status: { $in: ['Delivered', 'Completed', 'Successful'] },
          paymentStatus: { $in: ['Paid', 'Completed', 'Successful'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          fallbackProductName: { $first: '$items.productName' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalOrderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantitySold: -1, totalOrderCount: -1 } },
    ]);

    const productIds = sales.map((s) => s._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name')
      .lean();
    const nameById = new Map(products.map((p) => [p._id.toString(), p.name]));

    const formattedSales = sales
      .filter((s) => {
        const pid = s._id?.toString?.();
        return pid && nameById.has(pid);
      })
      .map((s) => {
      const pid = s._id?.toString?.();
      return {
        productId: s._id,
        productName: nameById.get(pid),
        totalQuantitySold: s.totalQuantitySold,
        totalOrderCount: s.totalOrderCount,
      };
      });

    res.status(200).json({
      success: true,
      count: formattedSales.length,
      data: formattedSales,
    });
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product sales',
      error: error.message,
    });
  }
};

