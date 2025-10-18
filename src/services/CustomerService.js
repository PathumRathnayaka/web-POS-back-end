/**
 * Customer Service
 * Handles business logic for customer operations
 */
import databaseManager from '../config/database.js';
import { Customer } from '../models/Customer.js';

export class CustomerService {
  constructor() {
    this.collectionName = 'customers';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    try {
      const customer = Customer.create(customerData);
      const validation = customer.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().insertOne(customer.toDocument());
      
      return {
        success: true,
        data: Customer.fromDocument({ _id: result.insertedId, ...customer.toDocument() }),
        message: 'Customer created successfully'
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customers list
   */
  async getAllCustomers(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const customers = await this.getCollection()
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments();

      const formattedCustomers = customers.map(customer => 
        Customer.fromDocument(customer)
      );

      return {
        success: true,
        data: formattedCustomers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(id) {
    try {
      const customer = await this.getCollection().findOne({ _id: id });
      
      if (!customer) {
        throw new Error('Customer not found');
      }

      return {
        success: true,
        data: Customer.fromDocument(customer)
      };
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by MySQL ID
   * @param {number} mysqlId - MySQL ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerByMysqlId(mysqlId) {
    try {
      const customer = await this.getCollection().findOne({ mysqlId });
      
      if (!customer) {
        throw new Error('Customer not found');
      }

      return {
        success: true,
        data: Customer.fromDocument(customer)
      };
    } catch (error) {
      console.error('Error fetching customer by MySQL ID:', error);
      throw error;
    }
  }

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, updateData) {
    try {
      const customer = Customer.create(updateData);
      const validation = customer.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().updateOne(
        { _id: id },
        { $set: customer.toDocument() }
      );

      if (result.matchedCount === 0) {
        throw new Error('Customer not found');
      }

      const updatedCustomer = await this.getCustomerById(id);
      
      return {
        success: true,
        data: updatedCustomer.data,
        message: 'Customer updated successfully'
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteCustomer(id) {
    try {
      const result = await this.getCollection().deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new Error('Customer not found');
      }

      return {
        success: true,
        message: 'Customer deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  /**
   * Search customers
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchCustomers(query, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const searchFilter = {
        $or: [
          { contact: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { saleId: { $regex: query, $options: 'i' } }
        ]
      };

      const customers = await this.getCollection()
        .find(searchFilter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments(searchFilter);

      const formattedCustomers = customers.map(customer => 
        Customer.fromDocument(customer)
      );

      return {
        success: true,
        data: formattedCustomers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
}
