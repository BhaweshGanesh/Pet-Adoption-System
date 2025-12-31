import HostelBooking from '../model/HostelBookingmodel.js';
import HostelRoom from '../model/HostelRoommodel.js';
import User from '../model/Usermodel.js';
import { sendHostelBookingConfirmationEmail } from '../utils/emailService.js';

// @desc    Get all bookings (Admin)
// @route   GET /api/hostel-bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const bookings = await HostelBooking.find(filter)
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber roomName roomType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/hostel-bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await HostelBooking.find({ user: req.user.id })
      .populate('room', 'roomNumber roomName roomType pricePerDay image facilities')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/hostel-bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await HostelBooking.findById(req.params.id)
      .populate('user', 'fullName email phone')
      .populate('room', 'roomNumber roomName roomType pricePerDay image facilities');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};

// @desc    Create new booking
// @route   POST /api/hostel-bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      petDetails,
      checkInDate,
      checkOutDate,
      specialInstructions,
      emergencyContact,
    } = req.body;

    // Get authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get room details
    const room = await HostelRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if room is available
    if (room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Room is currently ${room.status.toLowerCase()}`,
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await HostelBooking.find({
      room: roomId,
      status: { $nin: ['Cancelled', 'Checked-Out'] },
      $or: [
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkIn },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for selected dates',
      });
    }

    // Calculate number of days and total amount
    const numberOfDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = numberOfDays * room.pricePerDay;

    // Create booking
    const booking = new HostelBooking({
      user: user._id,
      room: room._id,
      petDetails,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfDays,
      totalAmount,
      specialInstructions: specialInstructions || '',
      contactInfo: {
        email: user.email,
        phone: user.phone || req.body.phone || '',
        emergencyContact: emergencyContact || '',
      },
      status: 'Confirmed',
    });

    await booking.save();

    // Populate room details for email
    await booking.populate('room', 'roomNumber roomName roomType pricePerDay facilities');

    // Send confirmation email
    try {
      await sendHostelBookingConfirmationEmail(user.email, user.fullName, {
        bookingNumber: booking.bookingNumber,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        petName: petDetails.petName,
        petType: petDetails.petType,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        numberOfDays: booking.numberOfDays,
        totalAmount: booking.totalAmount,
        pricePerDay: room.pricePerDay,
        facilities: room.facilities,
        specialInstructions: booking.specialInstructions,
      });
      console.log(`✅ Booking confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating booking',
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/hostel-bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await HostelBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   PATCH /api/hostel-bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await HostelBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'Checked-In' || booking.status === 'Checked-Out') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`,
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(400).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message,
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/hostel-bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const booking = await HostelBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message,
    });
  }
};

