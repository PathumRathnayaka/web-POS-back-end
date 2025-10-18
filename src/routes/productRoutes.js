/**
 * Product Routes
 * Defines all product-related API endpoints
 */
import express from 'express';
import { ProductController } from '../controllers/ProductController.js';

const router = express.Router();
const productController = new ProductController();

// Get all products with quantities
router.get('/', productController.getAllProducts.bind(productController));

// Get product by ID
router.get('/:id', productController.getProductById.bind(productController));

// Get products by category
router.get('/category/:category', productController.getProductsByCategory.bind(productController));

// Search products by name or barcode
router.get('/search/:query', productController.searchProducts.bind(productController));


// Create a new product
router.post('/', productController.createProduct.bind(productController));

// Update product
router.put('/:id', productController.updateProduct.bind(productController));

// Delete product
router.delete('/:id', productController.deleteProduct.bind(productController));

export default router;
