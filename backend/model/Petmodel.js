import mongoose from 'mongoose';

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide pet name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please provide pet type'],
      enum: ['Dog', 'Cat', 'Rabbit', 'Other'],
      default: 'Dog',
    },
    breed: {
      type: String,
      required: [true, 'Please provide pet breed'],
      trim: true,
    },
    age: {
      type: String,
      required: [true, 'Please provide pet age'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Please provide pet gender'],
      enum: ['Male', 'Female'],
      default: 'Male',
    },
    status: {
      type: String,
      required: [true, 'Please provide pet status'],
      enum: ['Available', 'Booked', 'Unavailable'],
      default: 'Available',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      enum: ['Small', 'Medium', 'Large'],
      default: 'Medium',
    },
    vaccinated: {
      type: Boolean,
      default: false,
    },
    vaccinations: [{
  name: {
    type: String,
    required: true,
    enum: ['Rabies', 'DHPP', 'Parvovirus', 'Bordetella']
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: null
  },
  nextDue: {
    type: Date,
    default: null
  }
}],
    inShelter: {
      type: String,
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
petSchema.index({ status: 1, createdAt: -1 }); // Compound index for status and sorting
petSchema.index({ type: 1 }); // Index for filtering by type
petSchema.index({ breed: 1 }); // Index for filtering by breed
petSchema.index({ name: 'text', description: 'text' }); // Text search index

const Pet = mongoose.model('Pet', petSchema);

export default Pet;