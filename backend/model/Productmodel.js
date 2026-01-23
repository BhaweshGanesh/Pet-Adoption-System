import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['Toy', 'Food', 'Accessory'],
    },
    petType: {
      type: String,
      required: [true, 'Please provide pet type'],
      enum: ['Dog', 'Cat', 'Rabbit', 'All'],
      default: 'All',
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Unavailable', 'Out of Stock'],
      default: 'Available',
    },
    image: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: String,
      trim: true,
      default: '',
    },
    addedBy: {
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
productSchema.index({ category: 1, petType: 1 }); // Compound index for filtering
productSchema.index({ status: 1 }); // Index for status filtering
productSchema.index({ createdAt: -1 }); // Index for sorting by date
productSchema.index({ name: 'text', description: 'text', brand: 'text' }); // Text search index
productSchema.index({ stock: 1, lowStockThreshold: 1 }); // For low stock queries

// Virtual field to check if stock is low
productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Automatically update status based on stock
productSchema.pre('save', function(next) {
  // Only auto-manage status if it's not manually set to "Unavailable"
  if (this.status !== 'Unavailable') {
    if (this.stock === 0) {
      this.status = 'Out of Stock';
    } else if (this.status === 'Out of Stock' && this.stock > 0) {
      this.status = 'Available';
    }
  }
  // If status is "Unavailable", respect admin's choice regardless of stock
  next();
});

// Include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;

