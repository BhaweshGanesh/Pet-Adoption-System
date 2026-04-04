import mongoose from 'mongoose';

const hostelRoomReviewSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write your feedback'],
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

hostelRoomReviewSchema.index({ room: 1, user: 1 }, { unique: true });

const HostelRoomReview = mongoose.model('HostelRoomReview', hostelRoomReviewSchema);

export default HostelRoomReview;
