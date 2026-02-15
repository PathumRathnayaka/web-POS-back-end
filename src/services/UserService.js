/**
 * User Service
 * Handles business logic for user operations and authentication
 */
import databaseManager from '../config/database.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

export class UserService {
  constructor() {
    this.collectionName = 'users';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      secret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result with token
   */
  async login(credentials) {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Find user by username
      const userDoc = await this.getCollection().findOne({ username });
      
      if (!userDoc) {
        throw new Error('Invalid username or password');
      }

      const user = User.fromDocument(userDoc);

      // Compare password
      const isPasswordValid = await User.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Update last login
      await this.getCollection().updateOne(
        { _id: user.id },
        { $set: { lastLogin: new Date() } }
      );

      // Generate token
      const token = this.generateToken(user);

      // Return user data without password
      return {
        success: true,
        data: {
          user: user.toSafeObject(),
          token
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const user = User.create(userData);
      const validation = user.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if username already exists
      const existingUser = await this.getCollection().findOne({ username: user.username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password and save
      const userDoc = await user.toDocument();
      const result = await this.getCollection().insertOne(userDoc);
      
      const createdUser = User.fromDocument({ _id: result.insertedId, ...userDoc });
      
      return {
        success: true,
        data: createdUser.toSafeObject(),
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} User data
   */
  async getUserByUsername(username) {
    try {
      const userDoc = await this.getCollection().findOne({ username });
      
      if (!userDoc) {
        return null;
      }

      return User.fromDocument(userDoc).toSafeObject();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Verify token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token data
   */
  async verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}



