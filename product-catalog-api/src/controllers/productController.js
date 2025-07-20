const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendSuccess, sendCreated, sendError } = require('../utils/responseHelper');

// Get all products with advanced filtering and search
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive
    } = req.query;

    const query = {};
    
    // Search by name and description
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name description')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Product.countDocuments(query);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    };

    sendSuccess(res, 'Products retrieved successfully', products, pagination);
  } catch (error) {
    next(error);
  }
};

// Get single product
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');
    
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendSuccess(res, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

// Create new product
const createProduct = async (req, res, next) => {
  try {
    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return sendError(res, 400, 'Invalid category ID');
    }

    // Check for duplicate SKUs in variants
    const skus = req.body.variants.map(variant => variant.sku);
    const uniqueSkus = [...new Set(skus)];
    if (skus.length !== uniqueSkus.length) {
      return sendError(res, 400, 'Duplicate SKUs found in variants');
    }

    // Check if any SKU already exists
    const existingProduct = await Product.findOne({
      'variants.sku': { $in: skus }
    });
    if (existingProduct) {
      return sendError(res, 400, 'One or more SKUs already exist');
    }

    const product = await Product.create(req.body);
    await product.populate('category', 'name description');
    
    sendCreated(res, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // If category is being updated, verify it exists
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return sendError(res, 400, 'Invalid category ID');
      }
    }

    // If variants are being updated, check for duplicate SKUs
    if (req.body.variants) {
      const skus = req.body.variants.map(variant => variant.sku);
      const uniqueSkus = [...new Set(skus)];
      if (skus.length !== uniqueSkus.length) {
        return sendError(res, 400, 'Duplicate SKUs found in variants');
      }

      // Check if any new SKU conflicts with existing ones (excluding current product)
      const existingProduct = await Product.findOne({
        _id: { $ne: req.params.id },
        'variants.sku': { $in: skus }
      });
      if (existingProduct) {
        return sendError(res, 400, 'One or more SKUs already exist');
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name description');

    sendSuccess(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    sendSuccess(res, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Update product variant
const updateVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return sendError(res, 404, 'Variant not found');
    }

    // Check if SKU is being updated and if it conflicts
    if (req.body.sku && req.body.sku !== variant.sku) {
      const existingProduct = await Product.findOne({
        'variants.sku': req.body.sku
      });
      if (existingProduct) {
        return sendError(res, 400, 'SKU already exists');
      }
    }

    // Update variant properties
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        variant[key] = req.body[key];
      }
    });

    await product.save();

    sendSuccess(res, 'Variant updated successfully', variant);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariant
};