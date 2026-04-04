import Product from '../model/Productmodel.js';
import ProductReview from '../model/ProductReviewmodel.js';

const userMatches = (reviewUserId, reqUserId) =>
  reviewUserId?.toString() === reqUserId?.toString();

// GET /api/products/:productId/reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const reviews = await ProductReview.find({ product: productId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('getProductReviews:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews',
    });
  }
};

// POST /api/products/:productId/reviews
export const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
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

    const product = await Product.findById(productId).select('_id').lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await ProductReview.findOne({
      product: productId,
      user: req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already reviewed this product. You can edit your review instead.',
      });
    }

    const review = await ProductReview.create({
      product: productId,
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
        message: 'You already have a review for this product',
      });
    }
    console.error('createProductReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating review',
    });
  }
};

// PUT /api/products/:productId/reviews/:reviewId
export const updateProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await ProductReview.findOne({
      _id: reviewId,
      product: productId,
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
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      review.rating = r;
    }

    await review.save();
    await review.populate('user', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Review updated',
      data: review,
    });
  } catch (error) {
    console.error('updateProductReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating review',
    });
  }
};

// DELETE /api/products/:productId/reviews/:reviewId
export const deleteProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const review = await ProductReview.findOne({
      _id: reviewId,
      product: productId,
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

    await ProductReview.deleteOne({ _id: reviewId });

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    console.error('deleteProductReview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting review',
    });
  }
};
