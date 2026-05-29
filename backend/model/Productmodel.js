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
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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

productSchema.index({ category: 1, petType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ stock: 1, lowStockThreshold: 1 });

productSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

productSchema.virtual('offerPrice').get(function() {
  if (!this.discount || this.discount === 0) return this.price;
  return Math.round(this.price * (1 - this.discount / 100));
});

productSchema.pre('save', function(next) {
  if (this.status !== 'Unavailable') {
    if (this.stock === 0) {
      this.status = 'Out of Stock';
    } else if (this.status === 'Out of Stock' && this.stock > 0) {
      this.status = 'Available';
    }
  }
  next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;

