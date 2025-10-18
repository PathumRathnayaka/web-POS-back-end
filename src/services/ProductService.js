/**
 * Product Service
 * Handles business logic for product operations
 */
import databaseManager from '../config/database.js';
import { Product } from '../models/Product.js';
import { Quantity } from '../models/Quantity.js';

export class ProductService {
  constructor() {
    this.collectionName = 'products';
    this.quantityCollectionName = 'quantities';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  getQuantityCollection() {
    return databaseManager.getCollection(this.quantityCollectionName);
  }

  /**
   * Helper function to find quantity by product ID (handles multiple field name variations)
   * @param {number} productId - Product ID
   * @returns {Promise<Object|null>} Quantity data
   */
  async findQuantityByProductId(productId) {
    const quantity = await this.getQuantityCollection().findOne({
      $or: [
        { productMysqlId: productId },
        { product_mysql_id: productId },
        { productId: productId },
        { product_id: productId }
      ]
    });
    return quantity;
  }

  /**
   * Get all products with quantities
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products list
   */
  async getAllProducts(options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdDate', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const products = await this.getCollection()
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      const productsWithQuantities = await Promise.all(
        products.map(async (product) => {
          const productId = product.mysqlId || product.mysql_id || product.id;
          const quantity = await this.findQuantityByProductId(productId);
          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity);
        })
      );

      const totalCount = await this.getCollection().countDocuments();

      return {
        success: true,
        data: productsWithQuantities,
        count: productsWithQuantities.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    try {
      const productId = parseInt(id);
      const product = await this.getCollection().findOne({ 
        $or: [
          { mysqlId: productId },
          { mysql_id: productId },
          { id: productId }
        ]
      });
      
      if (!product) {
        throw new Error('Product not found');
      }

      const quantity = await this.findQuantityByProductId(productId);
      const productModel = Product.fromDocument(product);
      const productWithQuantity = productModel.formatWithQuantity(quantity);

      return {
        success: true,
        data: productWithQuantity
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Products list
   */
  async getProductsByCategory(category, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const products = await this.getCollection()
        .find({ category })
        .skip(skip)
        .limit(limit)
        .toArray();

      const productsWithQuantities = await Promise.all(
        products.map(async (product) => {
          const productId = product.mysqlId || product.mysql_id || product.id;
          const quantity = await this.findQuantityByProductId(productId);
          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity);
        })
      );

      const totalCount = await this.getCollection().countDocuments({ category });

      return {
        success: true,
        data: productsWithQuantities,
        count: productsWithQuantities.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Search products by name or barcode
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const searchFilter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { barcode: { $regex: query, $options: 'i' } }
        ]
      };

      const products = await this.getCollection()
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .toArray();

      const productsWithQuantities = await Promise.all(
        products.map(async (product) => {
          const productId = product.mysqlId || product.mysql_id || product.id;
          const quantity = await this.findQuantityByProductId(productId);
          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity);
        })
      );

      const totalCount = await this.getCollection().countDocuments(searchFilter);

      return {
        success: true,
        data: productsWithQuantities,
        count: productsWithQuantities.length,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const product = Product.create(productData);
      const validation = product.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().insertOne(product.toDocument());
      
      return {
        success: true,
        data: Product.fromDocument({ _id: result.insertedId, ...product.toDocument() }),
        message: 'Product created successfully'
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updateData) {
    try {
      const productId = parseInt(id);
      const product = Product.create(updateData);
      const validation = product.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await this.getCollection().updateOne(
        { 
          $or: [
            { mysqlId: productId },
            { mysql_id: productId },
            { id: productId }
          ]
        },
        { $set: product.toDocument() }
      );

      if (result.matchedCount === 0) {
        throw new Error('Product not found');
      }

      const updatedProduct = await this.getProductById(id);
      
      return {
        success: true,
        data: updatedProduct.data,
        message: 'Product updated successfully'
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProduct(id) {
    try {
      const productId = parseInt(id);
      const result = await this.getCollection().deleteOne({
        $or: [
          { mysqlId: productId },
          { mysql_id: productId },
          { id: productId }
        ]
      });

      if (result.deletedCount === 0) {
        throw new Error('Product not found');
      }

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}
