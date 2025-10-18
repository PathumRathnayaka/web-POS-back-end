/**
 * Sale Service
 * Handles business logic for sale operations
 */
import databaseManager from '../config/database.js';
import { Sale } from '../models/Sale.js';
import { SaleItem } from '../models/SaleItem.js';

export class SaleService {
  constructor() {
    this.collectionName = 'sales';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  /**
   * Create a new sale
   * @param {Object} saleData - Sale data
   * @returns {Promise<Object>} Created sale
   */
  async createSale(saleData) {
    try {
      const sale = Sale.create(saleData);
      const validation = sale.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate totals
      sale.calculateTotals();

      const result = await this.getCollection().insertOne(sale.toDocument());
      
      return {
        success: true,
        data: Sale.fromDocument({ _id: result.insertedId, ...sale.toDocument() }),
        message: 'Sale created successfully'
      };
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  /**
   * Get all sales
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Sales list
   */
  async getAllSales(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'timestamp', 
        sortOrder = -1,
        startDate,
        endDate,
        customerId
      } = options;
      
      const skip = (page - 1) * limit;
      let filter = {};

      // Add date range filter
      if (startDate || endDate) {
        filter.saleDate = {};
        if (startDate) filter.saleDate.$gte = new Date(startDate);
        if (endDate) filter.saleDate.$lte = new Date(endDate);
      }

      // Add customer filter
      if (customerId) {
        filter.customerId = customerId;
      }

      const sales = await this.getCollection()
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments(filter);

      const formattedSales = sales.map(sale => Sale.fromDocument(sale));

      return {
        success: true,
        data: formattedSales,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  /**
   * Get sale by ID
   * @param {string} id - Sale ID
   * @returns {Promise<Object>} Sale data
   */
  async getSaleById(id) {
    try {
      const sale = await this.getCollection().findOne({ _id: id });
      
      if (!sale) {
        throw new Error('Sale not found');
      }

      return {
        success: true,
        data: Sale.fromDocument(sale)
      };
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  /**
   * Get sale by MySQL ID
   * @param {number} mysqlId - MySQL ID
   * @returns {Promise<Object>} Sale data
   */
  async getSaleByMysqlId(mysqlId) {
    try {
      const sale = await this.getCollection().findOne({ mysqlId });
      
      if (!sale) {
        throw new Error('Sale not found');
      }

      return {
        success: true,
        data: Sale.fromDocument(sale)
      };
    } catch (error) {
      console.error('Error fetching sale by MySQL ID:', error);
      throw error;
    }
  }

  /**
   * Get sales by customer ID
   * @param {number} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Sales list
   */
  async getSalesByCustomerId(customerId, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const sales = await this.getCollection()
        .find({ customerId })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments({ customerId });

      const formattedSales = sales.map(sale => Sale.fromDocument(sale));

      return {
        success: true,
        data: formattedSales,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching sales by customer ID:', error);
      throw error;
    }
  }

  /**
   * Update sale
   * @param {string} id - Sale ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated sale
   */
  async updateSale(id, updateData) {
    try {
      const sale = Sale.create(updateData);
      const validation = sale.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate totals
      sale.calculateTotals();

      const result = await this.getCollection().updateOne(
        { _id: id },
        { $set: sale.toDocument() }
      );

      if (result.matchedCount === 0) {
        throw new Error('Sale not found');
      }

      const updatedSale = await this.getSaleById(id);
      
      return {
        success: true,
        data: updatedSale.data,
        message: 'Sale updated successfully'
      };
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  }

  /**
   * Delete sale
   * @param {string} id - Sale ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSale(id) {
    try {
      const result = await this.getCollection().deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new Error('Sale not found');
      }

      return {
        success: true,
        message: 'Sale deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }

  /**
   * Get sales analytics
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Analytics data
   */
  async getSalesAnalytics(options = {}) {
    try {
      const { startDate, endDate } = options;
      let matchFilter = {};

      if (startDate || endDate) {
        matchFilter.saleDate = {};
        if (startDate) matchFilter.saleDate.$gte = new Date(startDate);
        if (endDate) matchFilter.saleDate.$lte = new Date(endDate);
      }

      const pipeline = [
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            totalItemsSold: { $sum: { $size: '$saleItems' } },
            averageSaleAmount: { $avg: '$totalAmount' }
          }
        }
      ];

      const analytics = await this.getCollection().aggregate(pipeline).toArray();
      
      return {
        success: true,
        data: analytics[0] || {
          totalSales: 0,
          totalRevenue: 0,
          totalItemsSold: 0,
          averageSaleAmount: 0
        }
      };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  }
}