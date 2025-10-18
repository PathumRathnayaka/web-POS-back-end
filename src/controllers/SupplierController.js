/**
 * Supplier Controller
 * Handles HTTP requests for supplier operations
 */
import { SupplierService } from '../services/SupplierService.js';

export class SupplierController {
  constructor() {
    this.supplierService = new SupplierService();
  }

  /**
   * Create a new supplier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSupplier(req, res) {
    try {
      const result = await this.supplierService.createSupplier(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all suppliers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSuppliers(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'timestamp',
        sortOrder: parseInt(req.query.sortOrder) || -1
      };

      const result = await this.supplierService.getAllSuppliers(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get supplier by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSupplierById(req, res) {
    try {
      const result = await this.supplierService.getSupplierById(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Supplier not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get supplier by MySQL ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSupplierByMysqlId(req, res) {
    try {
      const mysqlId = parseInt(req.params.mysqlId);
      const result = await this.supplierService.getSupplierByMysqlId(mysqlId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Supplier not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update supplier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSupplier(req, res) {
    try {
      const result = await this.supplierService.updateSupplier(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Supplier not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete supplier
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSupplier(req, res) {
    try {
      const result = await this.supplierService.deleteSupplier(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Supplier not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search suppliers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchSuppliers(req, res) {
    try {
      const query = req.params.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await this.supplierService.searchSuppliers(query, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
