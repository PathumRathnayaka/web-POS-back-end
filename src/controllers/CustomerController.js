/**
 * Customer Controller
 * Handles HTTP requests for customer operations
 */
import { CustomerService } from '../services/CustomerService.js';

export class CustomerController {
  constructor() {
    this.customerService = new CustomerService();
  }

  /**
   * Create a new customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createCustomer(req, res) {
    try {
      const result = await this.customerService.createCustomer(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all customers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllCustomers(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'timestamp',
        sortOrder: parseInt(req.query.sortOrder) || -1
      };

      const result = await this.customerService.getAllCustomers(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get customer by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomerById(req, res) {
    try {
      const result = await this.customerService.getCustomerById(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get customer by MySQL ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCustomerByMysqlId(req, res) {
    try {
      const mysqlId = parseInt(req.params.mysqlId);
      const result = await this.customerService.getCustomerByMysqlId(mysqlId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateCustomer(req, res) {
    try {
      const result = await this.customerService.updateCustomer(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Customer not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteCustomer(req, res) {
    try {
      const result = await this.customerService.deleteCustomer(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search customers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchCustomers(req, res) {
    try {
      const query = req.params.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await this.customerService.searchCustomers(query, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
