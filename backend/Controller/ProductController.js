import Product from '../model/Productmodel.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { category, petType, status, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    
    if (category) filter.category = category;
    if (petType) filter.petType = petType;
    if (status) filter.status = status;
    
    // Use text index for search instead of $regex - much faster!
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Parallel execution of queries for better performance
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean() // Use lean for faster queries
        .exec(),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    // Find the product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    // Save to trigger pre-save middleware for automatic status update
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private/Admin
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      stock: { $gt: 0 },
    }).sort({ stock: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message,
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating stock',
      error: error.message,
    });
  }
};

