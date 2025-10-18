/**
 * Quantity Routes
 * Defines all quantity-related API endpoints
 */
import express from 'express';
import { QuantityController } from '../controllers/QuantityController.js';

const router = express.Router();
const quantityController = new QuantityController();

// Get all quantities
router.get('/', quantityController.getAllQuantities.bind(quantityController));

// Get quantity by product MySQL ID
router.get('/product/:productId', quantityController.getQuantityByProductId.bind(quantityController));

// Get product with its quantities
router.get('/product/:id/with-quantities', quantityController.getProductWithQuantities.bind(quantityController));

// Create a new quantity
router.post('/', quantityController.createQuantity.bind(quantityController));

// Update quantity
router.put('/:id', quantityController.updateQuantity.bind(quantityController));

// Delete quantity
router.delete('/:id', quantityController.deleteQuantity.bind(quantityController));

export default router;
