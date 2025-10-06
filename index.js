import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;
let productsCollection;
let quantitiesCollection;

// MongoDB connection
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://thilinapathumrathnayaka:Bn4mUAbsl2UpAoZg@cluster0.di4pjcd.mongodb.net/pos_cloud?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,  // Increased to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
    });

    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db('pos_cloud');
    productsCollection = db.collection('products');
    quantitiesCollection = db.collection('quantities');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Debug endpoint to check MongoDB structure
app.get('/api/debug', async (req, res) => {
  try {
    const sampleProduct = await productsCollection.findOne({});
    const sampleQuantity = await quantitiesCollection.findOne({});
    
    res.json({
      success: true,
      data: {
        sampleProduct,
        sampleQuantity,
        productFields: sampleProduct ? Object.keys(sampleProduct) : [],
        quantityFields: sampleQuantity ? Object.keys(sampleQuantity) : []
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products with quantities
app.get('/api/products', async (req, res) => {
  try {
    const products = await productsCollection.find({}).toArray();
    
    // Fetch quantities for all products
    const productsWithQuantities = await Promise.all(
      products.map(async (product) => {
        const quantity = await quantitiesCollection.findOne({ 
          productMysqlId: product.mysqlId 
        });
        
        return {
          id: product.mysqlId,
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
            product_id: product.mysqlId,
            quantity_size: quantity.quantitySize || quantity.quantity_size,
            created_date: quantity.createdDate || quantity.created_date,
            updated_date: quantity.updatedDate || quantity.updated_date
          } : null
        };
      })
    );
    
    res.json({ success: true, data: productsWithQuantities, count: productsWithQuantities.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productsCollection.findOne({ mysqlId: parseInt(req.params.id) });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const quantity = await quantitiesCollection.findOne({ 
      productMysqlId: product.mysqlId 
    });
    
    const productWithQuantity = {
      id: product.mysqlId,
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
        product_id: product.mysqlId,
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
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await productsCollection.find({ category: req.params.category }).toArray();
    
    const productsWithQuantities = await Promise.all(
      products.map(async (product) => {
        const quantity = await quantitiesCollection.findOne({ 
          productMysqlId: product.mysqlId 
        });
        
        return {
          id: product.mysqlId,
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
            product_id: product.mysqlId,
            quantity_size: quantity.quantitySize || quantity.quantity_size,
            created_date: quantity.createdDate || quantity.created_date,
            updated_date: quantity.updatedDate || quantity.updated_date
          } : null
        };
      })
    );
    
    res.json({ success: true, data: productsWithQuantities, count: productsWithQuantities.length });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search products by name or barcode
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const products = await productsCollection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
    
    const productsWithQuantities = await Promise.all(
      products.map(async (product) => {
        const quantity = await quantitiesCollection.findOne({ 
          productMysqlId: product.mysqlId 
        });
        
        return {
          id: product.mysqlId,
          name: product.name,
          barcode: product.barcode,
          discount: product.discount,
          tax: product.tax,
          sale_price: product.sale_price,
          category: product.category,
          expire_date: product.expire_date,
          supplier_id: product.supplier_id,
          supplier_name: product.supplier_name,
          created_date: product.created_date,
          quantities: quantity ? {
            id: quantity._id,
            product_id: product.mysqlId,
            quantity_size: quantity.quantity_size,
            created_date: quantity.created_date,
            updated_date: quantity.updated_date
          } : null
        };
      })
    );
    
    res.json({ success: true, data: productsWithQuantities, count: productsWithQuantities.length });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all quantities
app.get('/api/quantities', async (req, res) => {
  try {
    const quantities = await quantitiesCollection.find({}).toArray();
    res.json({ success: true, data: quantities, count: quantities.length });
  } catch (error) {
    console.error('Error fetching quantities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quantity by product MySQL ID
app.get('/api/quantities/product/:productId', async (req, res) => {
  try {
    const quantities = await quantitiesCollection.find({
      productMysqlId: parseInt(req.params.productId)
    }).toArray();
    res.json({ success: true, data: quantities, count: quantities.length });
  } catch (error) {
    console.error('Error fetching quantities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product with its quantities
app.get('/api/products/:id/with-quantities', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productsCollection.findOne({ mysqlId: productId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const quantities = await quantitiesCollection.find({ productMysqlId: productId }).toArray();

    res.json({
      success: true,
      data: {
        ...product,
        quantities
      }
    });
  } catch (error) {
    console.error('Error fetching product with quantities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/products`);
  });
};

startServer();