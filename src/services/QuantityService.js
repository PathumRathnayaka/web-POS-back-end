/**
 * Quantity Service
 * Handles business logic for quantity operations
 */
import databaseManager from '../config/database.js';
import { Quantity } from '../models/Quantity.js';

export class QuantityService {
  constructor() {
    this.collectionName = 'quantities';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  /**
   * Get all quantities
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Quantities list
   */
  async getAllQuantities(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdDate', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const quantities = await this.getCollection()
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const formattedQuantities = quantities.map(quantity => 
        Quantity.fromDocument(quantity)
      );

      const totalCount = await this.getCollection().countDocuments();

      return {
        success: true,
        data: formattedQuantities,
        count: formattedQuantities.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching quantities:', error);
      throw error;
    }
  }

  /**
   * Get quantity by product ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Quantity data
   */
  async getQuantityByProductId(productId) {
    try {
      const productIdNum = parseInt(productId);
      const quantities = await this.getCollection().find({
        $or: [
          { productMysqlId: productIdNum },
          { product_mysql_id: productIdNum },
          { productId: productIdNum },
          { product_id: productIdNum }
        ]
      }).toArray();

      const formattedQuantities = quantities.map(quantity => 
        Quantity.fromDocument(quantity)
      );

      return {
        success: true,
        data: formattedQuantities,
        count: formattedQuantities.length
      };
    } catch (error) {
      console.error('Error fetching quantities by product ID:', error);
      throw error;
    }
  }

  /**
   * Get product with its quantities
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Product with quantities
   */
  async getProductWithQuantities(productId) {
    try {
      const productIdNum = parseInt(productId);
      
      // Get product (assuming products collection exists)
      const productsCollection = databaseManager.getCollection('products');
      const product = await productsCollection.findOne({ 
        $or: [
          { mysqlId: productIdNum },
          { mysql_id: productIdNum },
          { id: productIdNum }
        ]
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Get quantities
      const quantities = await this.getCollection().find({
        $or: [
          { productMysqlId: productIdNum },
          { product_mysql_id: productIdNum },
          { productId: productIdNum },
          { product_id: productIdNum }
        ]
      }).toArray();

      const formattedQuantities = quantities.map(quantity => 
        Quantity.fromDocument(quantity)
      );

      return {
        success: true,
        data: {
          ...product,
          quantities: formattedQuantities
        }
      };
    } catch (error) {
      console.error('Error fetching product with quantities:', error);
      throw error;
    }
  }

  /**
   * Create a new quantity
   * @param {Object} quantityData - Quantity data
   * @returns {Promise<Object>} Created quantity
   */
  async createQuantity(quantityData) {
    try {
      const quantity = Quantity.create(quantityData);
      const validation = quantity.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().insertOne(quantity.toDocument());
      
      return {
        success: true,
        data: Quantity.fromDocument({ _id: result.insertedId, ...quantity.toDocument() }),
        message: 'Quantity created successfully'
      };
    } catch (error) {
      console.error('Error creating quantity:', error);
      throw error;
    }
  }

  /**
   * Update quantity
   * @param {string} id - Quantity ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated quantity
   */
  async updateQuantity(id, updateData) {
    try {
      const quantity = Quantity.create(updateData);
      const validation = quantity.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().updateOne(
        { _id: id },
        { 
          $set: {
            ...quantity.toDocument(),
            updatedDate: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('Quantity not found');
      }

      const updatedQuantity = await this.getCollection().findOne({ _id: id });
      
      return {
        success: true,
        data: Quantity.fromDocument(updatedQuantity),
        message: 'Quantity updated successfully'
      };
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  /**
   * Delete quantity
   * @param {string} id - Quantity ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteQuantity(id) {
    try {
      const result = await this.getCollection().deleteOne({ _id: id });

      if (result.deletedCount === 0) {
        throw new Error('Quantity not found');
      }

      return {
        success: true,
        message: 'Quantity deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting quantity:', error);
      throw error;
    }
  }
}
