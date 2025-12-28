import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined until generated
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Please provide customer name'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Please provide customer email'],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, 'Please provide customer phone'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Please provide delivery address'],
        trim: true,
      },
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Online Payment', 'Bank Transfer'],
      default: 'Cash on Delivery',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

