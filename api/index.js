/**
 * Vercel Serverless Function Handler
 * Main entry point for the WebPOS Backend API on Vercel
 */
import express from 'express';
import dotenv from 'dotenv';

// Import database manager
import databaseManager from '../src/config/database.js';

// Import middleware
import { 
  errorHandler, 
  notFound, 
  asyncHandler 
} from '../src/middleware/errorHandler.js';
import { 
  securityMiddleware, 
  compressionMiddleware, 
  loggingMiddleware,
  corsMiddleware 
} from '../src/middleware/security.js';

// Import routes
import customerRoutes from '../src/routes/customerRoutes.js';
import saleRoutes from '../src/routes/saleRoutes.js';
import supplierRoutes from '../src/routes/supplierRoutes.js';
import productRoutes from '../src/routes/productRoutes.js';
import quantityRoutes from '../src/routes/quantityRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Apply middleware
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection singleton
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }
  
  try {
    await databaseManager.connect();
    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Health check endpoint
app.get('/health', asyncHandler(async (req, res) => {
  await connectDB();
  const dbHealth = await databaseManager.getHealthStatus();
  res.json({
    status: 'ok',
    message: 'WebPOS Backend is running on Vercel',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WebPOS Backend API - Running on Vercel',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      customers: '/api/customers',
      sales: '/api/sales',
      suppliers: '/api/suppliers',
      products: '/api/products',
      quantities: '/api/quantities'
    }
  });
});

// API routes - ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quantities', quantityRoutes);

// Debug endpoint for database structure
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

// Export for Vercel
export default app;