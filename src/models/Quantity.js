/**
 * Quantity MongoDB Model
 * Represents product quantity information in the WebPOS system
 */
export class Quantity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.productMysqlId = data.productMysqlId || data.product_mysql_id || data.productId || data.product_id || null;
    this.quantitySize = data.quantitySize || data.quantity_size || 0;
    this.createdDate = data.createdDate || data.created_date || new Date();
    this.updatedDate = data.updatedDate || data.updated_date || new Date();
  }

  /**
   * Create a new quantity instance
   * @param {Object} data - Quantity data
   * @returns {Quantity} New quantity instance
   */
  static create(data) {
    return new Quantity({
      productMysqlId: data.productMysqlId || data.productId,
      quantitySize: data.quantitySize,
      createdDate: data.createdDate || new Date(),
      updatedDate: data.updatedDate || new Date()
    });
  }

  /**
   * Convert to MongoDB document format
   * @returns {Object} MongoDB document
   */
  toDocument() {
    return {
      productMysqlId: this.productMysqlId,
      quantitySize: this.quantitySize,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {Quantity} Quantity instance
   */
  static fromDocument(doc) {
    return new Quantity({
      id: doc._id,
      productMysqlId: doc.productMysqlId,
      quantitySize: doc.quantitySize,
      createdDate: doc.createdDate,
      updatedDate: doc.updatedDate
    });
  }

  /**
   * Validate quantity data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.productMysqlId) {
      errors.push('Product ID is required');
    }

    if (this.quantitySize < 0) {
      errors.push('Quantity size must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
