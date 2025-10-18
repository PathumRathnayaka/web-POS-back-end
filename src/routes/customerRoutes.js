/**
 * Customer Routes
 * Defines all customer-related API endpoints
 */
import express from 'express';
import { CustomerController } from '../controllers/CustomerController.js';

const router = express.Router();
const customerController = new CustomerController();

// Create a new customer
router.post('/', customerController.createCustomer.bind(customerController));

// Get all customers with pagination
router.get('/', customerController.getAllCustomers.bind(customerController));

// Search customers
router.get('/search/:query', customerController.searchCustomers.bind(customerController));

// Get customer by MongoDB ID
router.get('/:id', customerController.getCustomerById.bind(customerController));

// Get customer by MySQL ID
router.get('/mysql/:mysqlId', customerController.getCustomerByMysqlId.bind(customerController));

// Update customer
router.put('/:id', customerController.updateCustomer.bind(customerController));

// Delete customer
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

export default router;
