import HostelRoom from '../model/HostelRoommodel.js';

export const getAllRooms = async (req, res) => {
  try {
    const { status, petType, roomType } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (petType && petType !== 'All') filter.petType = { $in: [petType, 'All'] };
    if (roomType) filter.roomType = roomType;

    const rooms = await HostelRoom.find(filter).sort({ roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Error fetching hostel rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hostel rooms',
      error: error.message,
    });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message,
    });
  }
};

export const createRoom = async (req, res) => {
  try {
    const room = await HostelRoom.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating room',
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating room',
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message,
    });
  }
};

export const checkRoomAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.body;
    const room = await HostelRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (room.status !== 'Available') {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Room is currently ${room.status.toLowerCase()}`,
      });
    }

    const HostelBooking = (await import('../model/HostelBookingmodel.js')).default;

    const overlappingBookings = await HostelBooking.find({
      room: req.params.id,
      status: { $nin: ['Cancelled', 'Checked-Out'] },
      $or: [
        {
          checkInDate: { $lte: new Date(checkOutDate) },
          checkOutDate: { $gte: new Date(checkInDate) },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Room is already booked for selected dates',
      });
    }

    res.status(200).json({
      success: true,
      available: true,
      message: 'Room is available for selected dates',
      data: room,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message,
    });
  }
};

