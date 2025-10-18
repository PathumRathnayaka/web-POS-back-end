/**
 * WebPOS Backend Application
 * Main application file with proper structure
 */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import database manager
import databaseManager from './src/config/database.js';

// Import middleware
import { 
  errorHandler, 
  notFound, 
  asyncHandler 
} from './src/middleware/errorHandler.js';
import { 
  securityMiddleware, 
  compressionMiddleware, 
  rateLimitMiddleware, 
  loggingMiddleware,
  corsMiddleware 
} from './src/middleware/security.js';

// Import routes
import customerRoutes from './src/routes/customerRoutes.js';
import saleRoutes from './src/routes/saleRoutes.js';
import supplierRoutes from './src/routes/supplierRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  const dbHealth = await databaseManager.getHealthStatus();
  res.json({
    status: 'ok',
    message: 'WebPOS Backend is running',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
}));

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/suppliers', supplierRoutes);

// Legacy product endpoints (keeping existing functionality)
app.get('/api/products', asyncHandler(async (req, res) => {
  try {
    const productsCollection = databaseManager.getCollection('products');
    const quantitiesCollection = databaseManager.getCollection('quantities');
    
    const products = await productsCollection.find({}).toArray();
    
    const productsWithQuantities = await Promise.all(
      products.map(async (product) => {
        const productId = product.mysqlId || product.mysql_id || product.id;
        const quantity = await quantitiesCollection.findOne({
          $or: [
            { productMysqlId: productId },
            { product_mysql_id: productId },
            { productId: productId },
            { product_id: productId }
          ]
        });
        
        return {
          id: product.mysqlId || product.mysql_id || product.id,
          name: product.name,
          barcode: product.barcode,
          discount: product.discount,
          tax: product.tax,
          sale_price: product.salePrice || product.sale_price,
          category: product.category,
          expire_date: product.expireDate || product.expire_date,
          supplier_id: product.supplierId || product.supplier_id,
          supplier_name: product.supplierName || product.supplier_name,
          created_date: product.createdDate || product.created_date,
          quantities: quantity ? {
            id: quantity._id,
            product_id: product.mysqlId || product.mysql_id || product.id,
            quantity_size: quantity.quantitySize || quantity.quantity_size,
            created_date: quantity.createdDate || quantity.created_date,
            updated_date: quantity.updatedDate || quantity.updated_date
          } : null
        };
      })
    );
    
    res.json({ 
      success: true, 
      data: productsWithQuantities, 
      count: productsWithQuantities.length 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
  try {
    const productsCollection = databaseManager.getCollection('products');
    const quantitiesCollection = databaseManager.getCollection('quantities');
    
    const productId = parseInt(req.params.id);
    const product = await productsCollection.findOne({ 
      $or: [
        { mysqlId: productId },
        { mysql_id: productId },
        { id: productId }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const quantity = await quantitiesCollection.findOne({
      $or: [
        { productMysqlId: productId },
        { product_mysql_id: productId },
        { productId: productId },
        { product_id: productId }
      ]
    });
    
    const productWithQuantity = {
      id: product.mysqlId || product.mysql_id || product.id,
      name: product.name,
      barcode: product.barcode,
      discount: product.discount,
      tax: product.tax,
      sale_price: product.salePrice || product.sale_price,
      category: product.category,
      expire_date: product.expireDate || product.expire_date,
      supplier_id: product.supplierId || product.supplier_id,
      supplier_name: product.supplierName || product.supplier_name,
      created_date: product.createdDate || product.created_date,
      quantities: quantity ? {
        id: quantity._id,
        product_id: product.mysqlId || product.mysql_id || product.id,
        quantity_size: quantity.quantitySize || quantity.quantity_size,
        created_date: quantity.createdDate || quantity.created_date,
        updated_date: quantity.updatedDate || quantity.updated_date
      } : null
    };
    
    res.json({ success: true, data: productWithQuantity });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// Debug endpoint
app.get('/api/debug', asyncHandler(async (req, res) => {
  try {
    const productsCollection = databaseManager.getCollection('products');
    const quantitiesCollection = databaseManager.getCollection('quantities');
    
    const sampleProduct = await productsCollection.findOne({});
    const sampleQuantity = await quantitiesCollection.findOne({});
    const allQuantities = await quantitiesCollection.find({}).limit(5).toArray();
    
    res.json({
      success: true,
      data: {
        sampleProduct,
        sampleQuantity,
        productFields: sampleProduct ? Object.keys(sampleProduct) : [],
        quantityFields: sampleQuantity ? Object.keys(sampleQuantity) : [],
        allQuantitiesSample: allQuantities,
        totalQuantities: await quantitiesCollection.countDocuments()
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await databaseManager.connect();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 WebPOS Backend Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/health`);
      console.log(`🔍 Debug endpoint: http://localhost:${PORT}/api/debug`);
      console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`🛒 Sales API: http://localhost:${PORT}/api/sales`);
      console.log(`🏢 Suppliers API: http://localhost:${PORT}/api/suppliers`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.close();
  process.exit(0);
});

// Start the server
startServer();
