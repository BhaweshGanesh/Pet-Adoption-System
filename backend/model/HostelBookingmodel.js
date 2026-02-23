import mongoose from 'mongoose';

const hostelBookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined until generated
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
      required: true,
    },
    petDetails: {
      petName: {
        type: String,
        required: [true, 'Please provide pet name'],
        trim: true,
      },
      petType: {
        type: String,
        enum: ['Dog', 'Cat', 'Rabbit', 'Other'],
        required: true,
      },
      age: {
        type: String,
        trim: true,
        default: '',
      },
      breed: {
        type: String,
        trim: true,
        default: '',
      },
      specialNeeds: {
        type: String,
        trim: true,
        default: '',
      },
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date'],
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Khalti', 'Bank Transfer'],
      default: 'Cash',
    },
    khaltiPayment: {
      idx: { type: String }, // Khalti payment identifier
      token: { type: String }, // Khalti token
      amount: { type: Number }, // Amount in paisa (Khalti uses paisa)
      mobile: { type: String }, // Payer's mobile number
      productIdentity: { type: String }, // Product identity (booking number)
      productName: { type: String }, // Product name (room name)
      verifiedAt: { type: Date }, // When payment was verified
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      emergencyContact: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate booking number before saving
hostelBookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `HB-${timestamp}${random}`;
  }
  next();
});

// Index for faster queries
hostelBookingSchema.index({ user: 1, status: 1 });
hostelBookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

const HostelBooking = mongoose.model('HostelBooking', hostelBookingSchema);

export default HostelBooking;

