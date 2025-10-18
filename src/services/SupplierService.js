/**
 * Supplier Service
 * Handles business logic for supplier operations
 */
import databaseManager from '../config/database.js';
import { Supplier } from '../models/Supplier.js';

export class SupplierService {
  constructor() {
    this.collectionName = 'suppliers';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  /**
   * Create a new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Promise<Object>} Created supplier
   */
  async createSupplier(supplierData) {
    try {
      const supplier = Supplier.create(supplierData);
      const validation = supplier.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().insertOne(supplier.toDocument());
      
      return {
        success: true,
        data: Supplier.fromDocument({ _id: result.insertedId, ...supplier.toDocument() }),
        message: 'Supplier created successfully'
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Get all suppliers
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Suppliers list
   */
  async getAllSuppliers(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const suppliers = await this.getCollection()
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments();

      const formattedSuppliers = suppliers.map(supplier => 
        Supplier.fromDocument(supplier)
      );

      return {
        success: true,
        data: formattedSuppliers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>} Supplier data
   */
  async getSupplierById(id) {
    try {
      const supplier = await this.getCollection().findOne({ _id: id });
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return {
        success: true,
        data: Supplier.fromDocument(supplier)
      };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  }

  /**
   * Get supplier by MySQL ID
   * @param {number} mysqlId - MySQL ID
   * @returns {Promise<Object>} Supplier data
   */
  async getSupplierByMysqlId(mysqlId) {
    try {
      const supplier = await this.getCollection().findOne({ mysqlId });
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return {
        success: true,
        data: Supplier.fromDocument(supplier)
      };
    } catch (error) {
      console.error('Error fetching supplier by MySQL ID:', error);
      throw error;
    }
  }

  /**
   * Update supplier
   * @param {string} id - Supplier ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated supplier
   */
  async updateSupplier(id, updateData) {
    try {
      const supplier = Supplier.create(updateData);
      const validation = supplier.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().updateOne(
        { _id: id },
        { $set: supplier.toDocument() }
      );

      if (result.matchedCount === 0) {
        throw new Error('Supplier not found');
      }

      const updatedSupplier = await this.getSupplierById(id);
      
      return {
        success: true,
        data: updatedSupplier.data,
        message: 'Supplier updated successfully'
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Delete supplier
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSupplier(id) {
    try {
      const result = await this.getCollection().deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new Error('Supplier not found');
      }

      return {
        success: true,
        message: 'Supplier deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  /**
   * Search suppliers
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchSuppliers(query, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const searchFilter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { contact: { $regex: query, $options: 'i' } },
          { contactPerson: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      };

      const suppliers = await this.getCollection()
        .find(searchFilter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await this.getCollection().countDocuments(searchFilter);

      const formattedSuppliers = suppliers.map(supplier => 
        Supplier.fromDocument(supplier)
      );

      return {
        success: true,
        data: formattedSuppliers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }
}