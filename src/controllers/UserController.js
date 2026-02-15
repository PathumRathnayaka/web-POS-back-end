/**
 * User Controller
 * Handles HTTP requests for user operations and authentication
 */
import { UserService } from '../services/UserService.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const result = await this.userService.login(req.body);
      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('Invalid') ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const result = await this.userService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Verify token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = await this.userService.verifyToken(token);
      res.json({
        success: true,
        data: decoded
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
}



