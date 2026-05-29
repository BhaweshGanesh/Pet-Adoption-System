import User from '../model/Usermodel.js';
import Pet from '../model/Petmodel.js';
import HostelRoom from '../model/HostelRoommodel.js';
import HostelBooking from '../model/HostelBookingmodel.js';
import Order from '../model/Ordermodel.js';
import Product from '../model/Productmodel.js';
import AdoptionApplication from '../model/AdoptionApplicationmodel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStaff,
      totalPets,
      availablePets,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalBookings,
      activeBookings,
      totalOrders,
      totalRevenue,
      pendingAdoptions,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'staff', isVerified: true }),

      Pet.countDocuments(),
      Pet.countDocuments({ status: 'Available' }),

      HostelRoom.countDocuments(),
      HostelRoom.countDocuments({ status: 'Occupied' }),
      HostelRoom.countDocuments({ status: 'Available' }),

      HostelBooking.countDocuments(),
      HostelBooking.countDocuments({ status: { $in: ['Confirmed', 'Checked-In'] } }),

      Order.countDocuments({
        status: 'Delivered',
        paymentStatus: 'Paid'
      }),
      Order.aggregate([
        {
          $match: {
            status: 'Delivered',
            paymentStatus: 'Paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),

      AdoptionApplication.countDocuments({ status: 'Pending' }),

      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 } }),
    ]);

    const occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await HostelBooking.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      status: 'Delivered',
      paymentStatus: 'Paid'
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalUsers,
        },
        staff: {
          total: totalStaff,
          active: totalStaff,
        },
        pets: {
          total: totalPets,
          available: availablePets,
          adopted: totalPets - availablePets,
        },
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          available: availableRooms,
          occupancyRate,
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          recent: recentBookings,
        },
        orders: {
          total: totalOrders,
          recent: recentOrders,
          revenue: totalRevenue[0]?.total || 0,
        },
        adoptions: {
          pending: pendingAdoptions,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentBookings = await HostelBooking.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber roomName')
      .select('bookingNumber status createdAt petDetails')
      .lean();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'fullName email')
      .select('orderNumber status totalAmount createdAt')
      .lean();

    const recentAdoptions = await AdoptionApplication.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'fullName email')
      .populate('petId', 'name type')
      .select('status createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        bookings: recentBookings,
        orders: recentOrders,
        adoptions: recentAdoptions,
      },
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
    });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
          status: 'Delivered',
          paymentStatus: 'Paid'
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productRef',
        },
      },
      { $match: { productRef: { $ne: [] } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$items.subtotal' },
          orderIds: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          revenue: 1,
          count: { $size: '$orderIds' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlyBookingRevenue = await HostelBooking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const revenueData = months.map((month, index) => {
      const monthNum = index + 1;
      const orderData = monthlyRevenue.find(item => item._id === monthNum);
      const bookingData = monthlyBookingRevenue.find(item => item._id === monthNum);

      return {
        month,
        orders: orderData?.revenue || 0,
        bookings: bookingData?.revenue || 0,
        total: (orderData?.revenue || 0) + (bookingData?.revenue || 0),
        orderCount: orderData?.count || 0,
        bookingCount: bookingData?.count || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
    });
  }
};

export const getAllUsersOverview = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'all' } = req.query;

    const query = {};
    if (role !== 'all') {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password -verificationCode -resetPasswordCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
};

export const getRoomsOverview = async (req, res) => {
  try {
    const rooms = await HostelRoom.find()
      .populate('currentOccupant.userId', 'fullName email')
      .sort({ roomNumber: 1 })
      .lean();

    const roomsWithBookings = await Promise.all(
      rooms.map(async (room) => {
        const activeBooking = await HostelBooking.findOne({
          room: room._id,
          status: { $in: ['Confirmed', 'Checked-In'] },
        })
          .populate('user', 'fullName email')
          .lean();

        return {
          ...room,
          activeBooking,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: roomsWithBookings,
    });
  } catch (error) {
    console.error('Error fetching rooms overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms overview',
    });
  }
};

export const getBookingsOverview = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await HostelBooking.find(query)
      .populate('user', 'fullName email phone')
      .populate('room', 'roomNumber roomName roomType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await HostelBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings overview',
    });
  }
};
