const Category = require('../models/Category');
const { sendSuccess, sendCreated, sendError } = require('../utils/responseHelper');

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const query = {};
    
    // Add search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments(query);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    };

    sendSuccess(res, 'Categories retrieved successfully', categories, pagination);
  } catch (error) {
    next(error);
  }
};

// Get single category
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    sendCreated(res, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    sendSuccess(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};