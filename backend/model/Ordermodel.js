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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional - for authenticated users
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Unpaid'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Online Payment', 'Bank Transfer', 'Khalti'],
      default: 'Cash on Delivery',
    },
    khaltiPayment: {
      pidx: { type: String },         // Khalti e-Payment unique payment ID
      transactionId: { type: String }, // Khalti transaction ID after completion
      amount: { type: Number },        // Amount in paisa
      mobile: { type: String },        // Payer's mobile number
      verifiedAt: { type: Date },      // When payment was verified
      // Legacy v1 fields (kept for backward compatibility)
      idx: { type: String },
      token: { type: String },
      productIdentity: { type: String },
      productName: { type: String },
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

// Create indexes for frequently queried fields
orderSchema.index({ user: 1, createdAt: -1 }); // User orders sorted by date
orderSchema.index({ status: 1, createdAt: -1 }); // Orders by status
orderSchema.index({ paymentStatus: 1 }); // Payment status filtering
// Note: orderNumber already has index from unique: true in schema
orderSchema.index({ 'customer.email': 1 }); // Customer email lookup

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

