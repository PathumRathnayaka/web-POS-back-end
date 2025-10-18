/**
 * Quantity Controller
 * Handles HTTP requests for quantity operations
 */
import { QuantityService } from '../services/QuantityService.js';

export class QuantityController {
  constructor() {
    this.quantityService = new QuantityService();
  }

  /**
   * Get all quantities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllQuantities(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdDate',
        sortOrder: parseInt(req.query.sortOrder) || -1
      };

      const result = await this.quantityService.getAllQuantities(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get quantity by product ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getQuantityByProductId(req, res) {
    try {
      const result = await this.quantityService.getQuantityByProductId(req.params.productId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get product with its quantities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductWithQuantities(req, res) {
    try {
      const result = await this.quantityService.getProductWithQuantities(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create a new quantity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createQuantity(req, res) {
    try {
      const result = await this.quantityService.createQuantity(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update quantity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateQuantity(req, res) {
    try {
      const result = await this.quantityService.updateQuantity(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Quantity not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete quantity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteQuantity(req, res) {
    try {
      const result = await this.quantityService.deleteQuantity(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Quantity not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}
