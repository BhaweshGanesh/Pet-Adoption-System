import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true,
    },
    roomName: {
      type: String,
      required: [true, 'Please provide room name'],
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Deluxe', 'Suite', 'Shared'],
      default: 'Single',
    },
    petType: {
      type: String,
      enum: ['Dog', 'Cat', 'Rabbit', 'All'],
      default: 'All',
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: 0,
    },
    facilities: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Under Maintenance'],
      default: 'Available',
    },
    currentOccupant: {
      petName: {
        type: String,
        default: '',
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      checkIn: {
        type: Date,
      },
      checkOut: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
hostelRoomSchema.index({ status: 1, petType: 1 });

const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);

export default HostelRoom;

