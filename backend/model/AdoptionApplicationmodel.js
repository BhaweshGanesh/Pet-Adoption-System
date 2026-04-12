import mongoose from 'mongoose';

const adoptionApplicationSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: [true, 'Pet ID is required'],
    },
    petName: {
      type: String,
      required: [true, 'Pet name is required'],
    },
    // Applicant Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],    
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Must be at least 18 years old'],
    },
    occupation: {
      type: String,
      required: [true, 'Occupation is required'],
      trim: true,
    },
    // Pet Ownership Details
    ownsPets: {
      type: String,
      required: [true, 'Please specify if you own pets'],
      enum: ['yes', 'no'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for adoption'],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, 'Please specify your experience'],
      enum: ['yes', 'no'],
    },
    environment: {
      type: String,
      required: [true, 'Please specify your living environment'],
      enum: ['apartment', 'house', 'other'],
    },
    agree: {
      type: Boolean,
      required: [true, 'You must agree to the terms'],
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: 'You must agree to the adoption terms',
      },
    },
    // Application Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    // User who submitted (if logged in)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);

export default AdoptionApplication;

