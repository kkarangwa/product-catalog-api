const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendSuccess } = require('../utils/responseHelper');

// Get low stock report
const getLowStockReport = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({
      $expr: {
        $or: [
          {
            $anyElementTrue: {
              $map: {
                input: '$variants',
                as: 'variant',
                in: { $lte: ['$$variant.stock', '$$variant.lowStockThreshold'] }
              }
            }
          }
        ]
      }
    })
    .populate('category', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ 'variants.stock': 1 });

    const total = await Product.countDocuments({
      $expr: {
        $or: [
          {
            $anyElementTrue: {
              $map: {
                input: '$variants',
                as: 'variant',
                in: { $lte: ['$$variant.stock', '$$variant.lowStockThreshold'] }
              }
            }
          }
        ]
      }
    });

    // Transform data to show low stock variants specifically
    const lowStockItems = products.map(product => ({
      productId: product._id,
      productName: product.name,
      category: product.category,
      lowStockVariants: product.variants.filter(variant => 
        variant.stock <= variant.lowStockThreshold
      )
    }));

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    };

    sendSuccess(res, 'Low stock report generated successfully', lowStockItems, pagination);
  } catch (error) {
    next(error);
  }
};

// Get inventory summary
const getInventorySummary = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    
    // Get total stock value
    const products = await Product.find({ isActive: true });
    let totalStockValue = 0;
    let totalItems = 0;
    
    products.forEach(product => {
      product.variants.forEach(variant => {
        totalItems += variant.stock;
        totalStockValue += variant.stock * variant.price;
      });
    });

    // Get low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: {
        $or: [
          {
            $anyElementTrue: {
              $map: {
                input: '$variants',
                as: 'variant',
                in: { $lte: ['$$variant.stock', '$$variant.lowStockThreshold'] }
              }
            }
          }
        ]
      }
    });

    // Get out of stock count
    const outOfStockCount = await Product.countDocuments({
      $expr: {
        $allElementsTrue: {
          $map: {
            input: '$variants',
            as: 'variant',
            in: { $eq: ['$$variant.stock', 0] }
          }
        }
      }
    });

    const summary = {
      totalProducts,
      totalCategories,
      totalItems,
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount
    };

    sendSuccess(res, 'Inventory summary generated successfully', summary);
  } catch (error) {
    next(error);
  }
};

// Get category-wise product count
const getCategoryReport = async (req, res, next) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          productCount: 1
        }
      }
    ]);

    sendSuccess(res, 'Category-wise product count generated successfully', categoryStats);
  } catch (error) {
    next(error);
  }
};