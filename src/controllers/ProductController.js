/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
import { ProductService } from '../services/ProductService.js';

export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get all products with quantities
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProducts(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdDate',
        sortOrder: parseInt(req.query.sortOrder) || -1
      };

      const result = await this.productService.getAllProducts(options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductById(req, res) {
    try {
      const result = await this.productService.getProductById(req.params.id);
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
   * Get products by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductsByCategory(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await this.productService.getProductsByCategory(req.params.category, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search products by name or barcode
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchProducts(req, res) {
    try {
      const query = req.params.query;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await this.productService.searchProducts(query, options);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create a new product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      const result = await this.productService.createProduct(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    try {
      const result = await this.productService.updateProduct(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    try {
      const result = await this.productService.deleteProduct(req.params.id);
      res.json(result);
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}
