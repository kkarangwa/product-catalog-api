const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required for variant'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required for variant'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required for variant'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  discount: {
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
      default: 0
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  variants: [variantSchema],
  images: [{
    url: String,
    alt: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, {
  timestamps: true
});

// Indexes for better search and query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ 'variants.stock': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1 });

// Virtual for calculating discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount.percentage > 0) {
    const now = new Date();
    if ((!this.discount.startDate || this.discount.startDate <= now) &&
        (!this.discount.endDate || this.discount.endDate >= now)) {
      return this.basePrice * (1 - this.discount.percentage / 100);
    }
  }
  return this.basePrice;
});

// Virtual for total stock across all variants
productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

// Virtual for checking if product is low stock
productSchema.virtual('isLowStock').get(function() {
  return this.variants.some(variant => variant.stock <= variant.lowStockThreshold);
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);