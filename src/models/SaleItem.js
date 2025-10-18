/**
 * SaleItem MongoDB Model
 * Represents individual items within a sale
 */
export class SaleItem {
  constructor(data = {}) {
    this.mysqlId = data.mysqlId || null;
    this.productId = data.productId || null;
    this.productName = data.productName || '';
    this.category = data.category || '';
    this.quantity = data.quantity || 0;
    this.unitPrice = data.unitPrice || 0;
    this.subTotal = data.subTotal || 0;
  }

  /**
   * Create a new sale item instance
   * @param {Object} data - Sale item data
   * @returns {SaleItem} New sale item instance
   */
  static create(data) {
    return new SaleItem({
      mysqlId: data.mysqlId,
      productId: data.productId,
      productName: data.productName,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      subTotal: data.subTotal
    });
  }

  /**
   * Convert to MongoDB document format
   * @returns {Object} MongoDB document
   */
  toDocument() {
    return {
      mysqlId: this.mysqlId,
      productId: this.productId,
      productName: this.productName,
      category: this.category,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      subTotal: this.subTotal
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {SaleItem} Sale item instance
   */
  static fromDocument(doc) {
    return new SaleItem({
      mysqlId: doc.mysqlId,
      productId: doc.productId,
      productName: doc.productName,
      category: doc.category,
      quantity: doc.quantity,
      unitPrice: doc.unitPrice,
      subTotal: doc.subTotal
    });
  }

  /**
   * Calculate subtotal based on quantity and unit price
   * @returns {number} Calculated subtotal
   */
  calculateSubTotal() {
    this.subTotal = this.quantity * this.unitPrice;
    return this.subTotal;
  }

  /**
   * Validate sale item data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.productId) {
      errors.push('Product ID is required');
    }

    if (!this.productName || this.productName.trim() === '') {
      errors.push('Product name is required');
    }

    if (!this.quantity || this.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!this.unitPrice || this.unitPrice < 0) {
      errors.push('Unit price must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
