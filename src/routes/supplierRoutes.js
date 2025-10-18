/**
 * Supplier Routes
 * Defines all supplier-related API endpoints
 */
import express from 'express';
import { SupplierController } from '../controllers/SupplierController.js';

const router = express.Router();
const supplierController = new SupplierController();

// Create a new supplier
router.post('/', supplierController.createSupplier.bind(supplierController));

// Get all suppliers with pagination
router.get('/', supplierController.getAllSuppliers.bind(supplierController));

// Search suppliers
router.get('/search/:query', supplierController.searchSuppliers.bind(supplierController));

// Get supplier by MongoDB ID
router.get('/:id', supplierController.getSupplierById.bind(supplierController));

// Get supplier by MySQL ID
router.get('/mysql/:mysqlId', supplierController.getSupplierByMysqlId.bind(supplierController));

// Update supplier
router.put('/:id', supplierController.updateSupplier.bind(supplierController));

// Delete supplier
router.delete('/:id', supplierController.deleteSupplier.bind(supplierController));

export default router;
