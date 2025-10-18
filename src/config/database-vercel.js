/**
 * Database Configuration for Vercel Serverless
 * Optimized connection pooling and timeout settings
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  /**
   * Connect to MongoDB with Vercel optimizations
   * Uses connection pooling and singleton pattern
   * @returns {Promise<void>}
   */
  async connect() {
    // Return existing connection if already connected
    if (this.isConnected && this.client) {
      console.log('Using existing database connection');
      return;
    }

    // Return pending connection promise if connection in progress
    if (this.connectionPromise) {
      console.log('Waiting for pending connection');
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = this._createConnection();
    
    try {
      await this.connectionPromise;
      this.connectionPromise = null;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  /**
   * Internal method to create database connection
   * @private
   * @returns {Promise<void>}
   */
  async _createConnection() {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
      
      console.log('Creating new database connection...');
      
      // Optimized settings for Vercel serverless
      this.client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,   // Reduced for faster failures
        socketTimeoutMS: 15000,           // Reduced for serverless
        connectTimeoutMS: 5000,           // Reduced for serverless
        maxPoolSize: 5,                   // Smaller pool for serverless
        minPoolSize: 1,                   // Minimum connections
        maxIdleTimeMS: 30000,             // Close idle connections faster
        retryWrites: true,
        retryReads: true,
        w: 'majority',
        journal: true,
      });

      await this.client.connect();
      this.db = this.client.db('pos_cloud');
      this.isConnected = true;
      
      console.log('✅ Database connected successfully');
      
      // Initialize collections with indexes
      await this.initializeCollections();
      
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      this.isConnected = false;
      this.client = null;
      this.db = null;
      throw error;
    }
  }

  /**
   * Initialize collections with indexes
   * Only creates indexes if they don't exist
   * @returns {Promise<void>}
   */
  async initializeCollections() {
    try {
      const collections = [
        'customers',
        'sales', 
        'suppliers',
        'products',
        'quantities'
      ];

      const indexPromises = [];

      for (const collectionName of collections) {
        const collection = this.db.collection(collectionName);
        
        // Create indexes based on collection type
        switch (collectionName) {
          case 'customers':
            indexPromises.push(
              collection.createIndex({ mysqlId: 1 }, { background: true }),
              collection.createIndex({ saleId: 1 }, { background: true }),
              collection.createIndex({ contact: 1 }, { background: true }),
              collection.createIndex({ timestamp: -1 }, { background: true })
            );
            break;
            
          case 'sales':
            indexPromises.push(
              collection.createIndex({ mysqlId: 1 }, { background: true }),
              collection.createIndex({ saleId: 1 }, { background: true }),
              collection.createIndex({ customerId: 1 }, { background: true }),
              collection.createIndex({ saleDate: -1 }, { background: true }),
              collection.createIndex({ timestamp: -1 }, { background: true })
            );
            break;
            
          case 'suppliers':
            indexPromises.push(
              collection.createIndex({ mysqlId: 1 }, { background: true }),
              collection.createIndex({ name: 1 }, { background: true }),
              collection.createIndex({ contact: 1 }, { background: true }),
              collection.createIndex({ timestamp: -1 }, { background: true })
            );
            break;
            
          case 'products':
            indexPromises.push(
              collection.createIndex({ mysqlId: 1 }, { background: true }),
              collection.createIndex({ name: 1 }, { background: true }),
              collection.createIndex({ barcode: 1 }, { background: true }),
              collection.createIndex({ category: 1 }, { background: true })
            );
            break;
            
          case 'quantities':
            indexPromises.push(
              collection.createIndex({ productMysqlId: 1 }, { background: true }),
              collection.createIndex({ productId: 1 }, { background: true })
            );
            break;
        }
      }
      
      // Create indexes in parallel (non-blocking)
      await Promise.all(indexPromises);
      console.log('✅ Database indexes initialized');
      
    } catch (error) {
      // Log error but don't fail - indexes may already exist
      console.warn('Warning: Index initialization:', error.message);
    }
  }

  /**
   * Get database instance
   * @returns {Db} MongoDB database instance
   */
  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get collection
   * @param {string} collectionName - Collection name
   * @returns {Collection} MongoDB collection
   */
  getCollection(collectionName) {
    return this.getDatabase().collection(collectionName);
  }

  /**
   * Close database connection
   * Note: In Vercel serverless, connections are automatically closed
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        this.client = null;
        this.db = null;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean} Connection status
   */
  isDatabaseConnected() {
    return this.isConnected;
  }

  /**
   * Get database health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    try {
      if (!this.isConnected || !this.db) {
        return { 
          status: 'disconnected', 
          message: 'Database not connected' 
        };
      }

      // Ping the database
      await this.db.admin().ping();
      
      // Get collection names
      const collections = await this.db.listCollections().toArray();
      
      return { 
        status: 'connected', 
        message: 'Database is healthy',
        collections: collections.map(c => c.name),
        connectionPool: {
          maxSize: 5,
          minSize: 1,
          active: this.isConnected
        }
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message 
      };
    }
  }

  /**
   * Test connection
   * Useful for debugging
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.connect();
      const status = await this.getHealthStatus();
      return status.status === 'connected';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Handle process termination (for local development)
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    await databaseManager.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await databaseManager.close();
    process.exit(0);
  });
}

export default databaseManager;