const Joi = require('joi');

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(1000).required(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  basePrice: Joi.number().min(0).required(),
  discount: Joi.object({
    percentage: Joi.number().min(0).max(100).default(0),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate'))
  }),
  variants: Joi.array().items(
    Joi.object({
      size: Joi.string().allow(''),
      color: Joi.string().allow(''),
      material: Joi.string().allow(''),
      sku: Joi.string().required(),
      price: Joi.number().min(0).required(),
      stock: Joi.number().min(0).required(),
      lowStockThreshold: Joi.number().min(0).default(10)
    })
  ).min(1).required(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri(),
      alt: Joi.string()
    })
  ),
  tags: Joi.array().items(Joi.string()),
  weight: Joi.number().min(0),
  dimensions: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    height: Joi.number().min(0)
  })
});

const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(500),
  isActive: Joi.boolean().default(true)
});

// Validation middleware
const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

const validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

// Partial validation for updates
const validateProductUpdate = (req, res, next) => {
  const updateSchema = productSchema.fork(
    ['name', 'description', 'category', 'basePrice', 'variants'],
    (schema) => schema.optional()
  );
  
  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

const validateCategoryUpdate = (req, res, next) => {
  const updateSchema = categorySchema.fork(['name'], (schema) => schema.optional());
  
  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

module.exports = {
  validateProduct,
  validateCategory,
  validateProductUpdate,
  validateCategoryUpdate
};