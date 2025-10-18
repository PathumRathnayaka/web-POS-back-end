/**
 * Sale Routes
 * Defines all sale-related API endpoints
 */
import express from 'express';
import { SaleController } from '../controllers/SaleController.js';

const router = express.Router();
const saleController = new SaleController();

// Create a new sale
router.post('/', saleController.createSale.bind(saleController));

// Get all sales with pagination and filters
router.get('/', saleController.getAllSales.bind(saleController));

// Get sales analytics
router.get('/analytics', saleController.getSalesAnalytics.bind(saleController));

// Get sales by customer ID
router.get('/customer/:customerId', saleController.getSalesByCustomerId.bind(saleController));

// Get sale by MongoDB ID
router.get('/:id', saleController.getSaleById.bind(saleController));

// Get sale by MySQL ID
router.get('/mysql/:mysqlId', saleController.getSaleByMysqlId.bind(saleController));

// Update sale
router.put('/:id', saleController.updateSale.bind(saleController));

// Delete sale
router.delete('/:id', saleController.deleteSale.bind(saleController));

export default router;
