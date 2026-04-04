import HostelRoom from '../model/HostelRoommodel.js';
import HostelRoomReview from '../model/HostelRoomReviewmodel.js';

const userMatches = (reviewUserId, reqUserId) =>
  reviewUserId?.toString() === reqUserId?.toString();

// GET /api/hostel-rooms/:roomId/reviews
export const getHostelRoomReviews = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await HostelRoom.findById(roomId).select('_id').lean();
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    const reviews = await HostelRoomReview.find({ room: roomId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('getHostelRoomReviews:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews',
    });
  }
};

// POST /api/hostel-rooms/:roomId/reviews
export const createHostelRoomReview = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rating, comment } = req.body;
    const r = Number(rating);

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback text is required',
      });
    }
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const room = await HostelRoom.findById(roomId).select('_id').lean();
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const existing = await HostelRoomReview.findOne({
      room: roomId,
      user: req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this room. You can edit your review instead.',
      });
    }

    const review = await HostelRoomReview.create({
      room: roomId,
      user: req.user.id,
      rating: r,
      comment: String(comment).trim(),
    });
    await review.populate('user', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have a review for this room',
      });
    }
    console.error('createHostelRoomReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating review',
    });
  }
};

// PUT /api/hostel-rooms/:roomId/reviews/:reviewId
export const updateHostelRoomReview = async (req, res) => {
  try {
    const { roomId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await HostelRoomReview.findOne({
      _id: reviewId,
      room: roomId,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!userMatches(review.user, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own review',
      });
    }

    if (comment !== undefined) {
      if (!String(comment).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Feedback text cannot be empty',
        });
      }
      review.comment = String(comment).trim();
    }
    if (rating !== undefined) {
      const nr = Number(rating);
      if (!Number.isInteger(nr) || nr < 1 || nr > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = nr;
    }

    await review.save();
    await review.populate('user', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Review updated',
      data: review,
    });
  } catch (error) {
    console.error('updateHostelRoomReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating review',
    });
  }
};

// DELETE /api/hostel-rooms/:roomId/reviews/:reviewId
export const deleteHostelRoomReview = async (req, res) => {
  try {
    const { roomId, reviewId } = req.params;

    const review = await HostelRoomReview.findOne({
      _id: reviewId,
      room: roomId,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (!userMatches(review.user, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own review',
      });
    }

    await HostelRoomReview.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    console.error('deleteHostelRoomReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting review',
    });
  }
};
