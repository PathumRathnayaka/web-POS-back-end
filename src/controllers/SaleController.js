/**
 * Sale Controller
 * Handles HTTP requests for sale operations
 */
import { SaleService } from '../services/SaleService.js';

export class SaleController {
  constructor() {
    this.saleService = new SaleService();
  }

  /**
   * Create a new sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createSale(req, res) {
    try {
      const result = await this.saleService.createSale(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all sales
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSales(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'timestamp',
        sortOrder: parseInt(req.query.sortOrder) || -1,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        customerId: req.query.customerId ? parseInt(req.query.customerId) : undefined
      };

      const result = await this.saleService.getAllSales(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sale by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSaleById(req, res) {
    try {
      const result = await this.saleService.getSaleById(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Sale not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sale by MySQL ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSaleByMysqlId(req, res) {
    try {
      const mysqlId = parseInt(req.params.mysqlId);
      const result = await this.saleService.getSaleByMysqlId(mysqlId);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Sale not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sales by customer ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSalesByCustomerId(req, res) {
    try {
      const customerId = parseInt(req.params.customerId);
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'timestamp',
        sortOrder: parseInt(req.query.sortOrder) || -1
      };

      const result = await this.saleService.getSalesByCustomerId(customerId, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSale(req, res) {
    try {
      const result = await this.saleService.updateSale(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Sale not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete sale
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSale(req, res) {
    try {
      const result = await this.saleService.deleteSale(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Sale not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sales analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSalesAnalytics(req, res) {
    try {
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await this.saleService.getSalesAnalytics(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
