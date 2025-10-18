/**
 * Database Configuration and Connection Manager
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      const MONGODB_URI = process.env.MONGODB_URI || 
        'mongodb+srv://thilinapathumrathnayaka:Bn4mUAbsl2UpAoZg@cluster0.di4pjcd.mongodb.net/pos_cloud?retryWrites=true&w=majority&appName=Cluster0';
      
      console.log('Attempting to connect to MongoDB...');
      console.log('Connection string:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
      
      this.client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        retryReads: true,
      });

      await this.client.connect();
      this.db = this.client.db('pos_cloud');
      this.isConnected = true;
      
      console.log('✅ Connected to MongoDB successfully');
      
      // Initialize collections
      await this.initializeCollections();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Initialize collections with indexes
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

      for (const collectionName of collections) {
        const collection = this.db.collection(collectionName);
        
        // Create indexes for better performance
        switch (collectionName) {
          case 'customers':
            await collection.createIndex({ mysqlId: 1 });
            await collection.createIndex({ saleId: 1 });
            await collection.createIndex({ contact: 1 });
            await collection.createIndex({ timestamp: -1 });
            break;
            
          case 'sales':
            await collection.createIndex({ mysqlId: 1 });
            await collection.createIndex({ saleId: 1 });
            await collection.createIndex({ customerId: 1 });
            await collection.createIndex({ saleDate: -1 });
            await collection.createIndex({ timestamp: -1 });
            break;
            
          case 'suppliers':
            await collection.createIndex({ mysqlId: 1 });
            await collection.createIndex({ name: 1 });
            await collection.createIndex({ contact: 1 });
            await collection.createIndex({ timestamp: -1 });
            break;
            
          case 'products':
            await collection.createIndex({ mysqlId: 1 });
            await collection.createIndex({ name: 1 });
            await collection.createIndex({ barcode: 1 });
            await collection.createIndex({ category: 1 });
            await collection.createIndex({ supplierId: 1 });
            break;
            
          case 'quantities':
            await collection.createIndex({ productMysqlId: 1 });
            await collection.createIndex({ productId: 1 });
            break;
        }
        
        console.log(`✅ Initialized collection: ${collectionName}`);
      }
      
    } catch (error) {
      console.error('Error initializing collections:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   * @returns {Db} MongoDB database instance
   */
  getDatabase() {
    if (!this.isConnected) {
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
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('Database connection closed');
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
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      // Ping the database
      await this.db.admin().ping();
      
      return { 
        status: 'connected', 
        message: 'Database is healthy',
        collections: await this.db.listCollections().toArray()
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message 
      };
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;
