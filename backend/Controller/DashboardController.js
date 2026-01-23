import User from '../model/Usermodel.js';
import Pet from '../model/Petmodel.js';
import HostelRoom from '../model/HostelRoommodel.js';
import HostelBooking from '../model/HostelBookingmodel.js';
import Order from '../model/Ordermodel.js';
import Product from '../model/Productmodel.js';
import AdoptionApplication from '../model/AdoptionApplicationmodel.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Admin only
export const getDashboardStats = async (req, res) => {
  try {
    // Fetch all statistics in parallel for better performance
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
      // Users
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'staff', isVerified: true }),
      
      // Pets
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'Available' }),
      
      // Hostel Rooms
      HostelRoom.countDocuments(),
      HostelRoom.countDocuments({ status: 'Occupied' }),
      HostelRoom.countDocuments({ status: 'Available' }),
      
      // Bookings
      HostelBooking.countDocuments(),
      HostelBooking.countDocuments({ status: { $in: ['Confirmed', 'Checked-In'] } }),
      
      // Orders
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Adoptions
      AdoptionApplication.countDocuments({ status: 'Pending' }),
      
      // Products
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 10 } }),
    ]);

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 
      ? Math.round((occupiedRooms / totalRooms) * 100) 
      : 0;

    // Get recent bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await HostelBooking.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get recent orders (last 7 days)
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalUsers, // Can add isActive field later
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

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Admin only
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent bookings
    const recentBookings = await HostelBooking.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber roomName')
      .select('bookingNumber status createdAt petDetails')
      .lean();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'fullName email')
      .select('orderNumber status totalAmount createdAt')
      .lean();

    // Get recent adoption applications
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

// @desc    Get monthly revenue data
// @route   GET /api/dashboard/revenue
// @access  Admin only
export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get monthly revenue from orders
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
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

    // Get monthly booking revenue
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

    // Create array for all 12 months
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

// @desc    Get all users overview
// @route   GET /api/dashboard/users
// @access  Admin only
export const getAllUsersOverview = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'all' } = req.query;

    // Build query
    const query = {};
    if (role !== 'all') {
      query.role = role;
    }

    // Execute query with pagination
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

// @desc    Get room occupancy overview
// @route   GET /api/dashboard/rooms-overview
// @access  Admin only
export const getRoomsOverview = async (req, res) => {
  try {
    const rooms = await HostelRoom.find()
      .populate('currentOccupant.userId', 'fullName email')
      .sort({ roomNumber: 1 })
      .lean();

    // Get active bookings for each room
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

// @desc    Get bookings overview
// @route   GET /api/dashboard/bookings-overview
// @access  Admin only
export const getBookingsOverview = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;

    // Build query
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
