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
    this.quantityCollectionName = 'product_quantity_batches';
    this.returnsCollectionName = 'product_returns';
    this.suppliersCollectionName = 'suppliers';
  }

  getCollection() {
    return databaseManager.getCollection(this.collectionName);
  }

  getQuantityCollection() {
    return databaseManager.getCollection(this.quantityCollectionName);
  }

  getReturnsCollection() {
    return databaseManager.getCollection(this.returnsCollectionName);
  }

  getSuppliersCollection() {
    return databaseManager.getCollection(this.suppliersCollectionName);
  }

  /**
   * Helper function to compute total quantity for a product from product_quantity_batches
   * Sums the 'quantity' field across all non-deleted batches for the given product ID.
   * @param {number} productId - Product mysqlId
   * @returns {Promise<Object>} Aggregated quantity object with quantity_size field
   */
  async findQuantityByProductId(productId) {
    const batches = await this.getQuantityCollection()
      .find({
        $or: [
          { productId: productId },
          { product_id: productId }
        ],
        deleted: { $ne: true }
      })
      .toArray();

    const totalQuantity = batches.reduce((sum, batch) => {
      return sum + parseFloat(batch.quantity || 0);
    }, 0);

    return {
      quantity_size: totalQuantity,
      batches: batches
    };
  }

  /**
   * Find total returned quantity for a product from product_returns.
   * Searches returnItems embedded in each return document.
   * @param {number} productId - Product mysqlId
   * @returns {Promise<Object>} Return info: hasReturnedStock, totalReturnedQuantity
   */
  async findReturnsByProductId(productId) {
    const returns = await this.getReturnsCollection()
      .find({ 'returnItems.productId': productId })
      .toArray();

    let totalReturnedQuantity = 0;
    for (const ret of returns) {
      for (const item of (ret.returnItems || [])) {
        const itemProductId = typeof item.productId === 'object'
          ? Number(item.productId)
          : item.productId;
        if (itemProductId === productId) {
          totalReturnedQuantity += parseFloat(item.returnedQuantity || 0);
        }
      }
    }

    return {
      hasReturnedStock: totalReturnedQuantity > 0,
      totalReturnedQuantity
    };
  }

  /**
   * Check if a product is expired based on its expireDate or batch expireDates.
   * @param {Object} product - Raw product document
   * @param {Array}  batches - Batch documents for this product
   * @returns {boolean}
   */
  isProductExpired(product, batches) {
    const now = new Date();

    // Check product-level expireDate
    if (product.expireDate && new Date(product.expireDate) < now) {
      return true;
    }

    // A product is considered expired if ALL non-deleted batches are expired
    if (batches && batches.length > 0) {
      const allBatchesExpired = batches.every(
        (b) => b.expireDate && new Date(b.expireDate) < now
      );
      if (allBatchesExpired) return true;
    }

    return false;
  }

  /**
   * Find supplier info by its mysqlId
   * @param {number} supplierId - Supplier mysqlId
   * @returns {Promise<Object|null>} Supplier data
   */
  async findSupplierById(supplierId) {
    if (!supplierId) return null;
    return await this.getSuppliersCollection().findOne({ mysqlId: parseInt(supplierId) });
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
          const returnInfo = await this.findReturnsByProductId(productId);
          const isExpired = this.isProductExpired(product, quantity.batches);

          // Get supplier info from the first batch
          const supplierId = quantity.batches.length > 0 ? quantity.batches[0].supplierId : null;
          const supplier = await this.findSupplierById(supplierId);

          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity, returnInfo, isExpired, supplier);
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
      const returnInfo = await this.findReturnsByProductId(productId);
      const isExpired = this.isProductExpired(product, quantity.batches);

      // Get supplier info from the first batch
      const supplierId = quantity.batches.length > 0 ? quantity.batches[0].supplierId : null;
      const supplier = await this.findSupplierById(supplierId);

      const productModel = Product.fromDocument(product);
      const productWithQuantity = productModel.formatWithQuantity(quantity, returnInfo, isExpired, supplier);

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
          const returnInfo = await this.findReturnsByProductId(productId);
          const isExpired = this.isProductExpired(product, quantity.batches);

          // Get supplier info from the first batch
          const supplierId = quantity.batches.length > 0 ? quantity.batches[0].supplierId : null;
          const supplier = await this.findSupplierById(supplierId);

          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity, returnInfo, isExpired, supplier);
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
          const returnInfo = await this.findReturnsByProductId(productId);
          const isExpired = this.isProductExpired(product, quantity.batches);

          // Get supplier info from the first batch
          const supplierId = quantity.batches.length > 0 ? quantity.batches[0].supplierId : null;
          const supplier = await this.findSupplierById(supplierId);

          const productModel = Product.fromDocument(product);
          return productModel.formatWithQuantity(quantity, returnInfo, isExpired, supplier);
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
