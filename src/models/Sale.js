/**
 * Sale MongoDB Model
 * Represents a complete sale transaction
 */
export class Sale {
  constructor(data = {}) {
    this.id = data.id || null;
    this.mysqlId = data.mysqlId || null;
    this.saleId = data.saleId || '';
    this.customerId = data.customerId || null;
    this.customerContact = data.customerContact || '';
    this.saleItems = data.saleItems || [];
    this.subTotal = data.subTotal || 0;
    this.taxAmount = data.taxAmount || 0;
    this.discountAmount = data.discountAmount || 0;
    this.totalAmount = data.totalAmount || 0;
    this.paidAmount = data.paidAmount || 0;
    this.changeAmount = data.changeAmount || 0;
    this.paymentMethod = data.paymentMethod || '';
    this.saleDate = data.saleDate || new Date();
    this.timestamp = data.timestamp || Date.now();
  }

  /**
   * Create a new sale instance
   * @param {Object} data - Sale data
   * @returns {Sale} New sale instance
   */
  static create(data) {
    return new Sale({
      mysqlId: data.mysqlId,
      saleId: data.saleId,
      customerId: data.customerId,
      customerContact: data.customerContact,
      saleItems: data.saleItems || [],
      subTotal: data.subTotal || 0,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      totalAmount: data.totalAmount || 0,
      paidAmount: data.paidAmount || 0,
      changeAmount: data.changeAmount || 0,
      paymentMethod: data.paymentMethod,
      saleDate: data.saleDate || new Date(),
      timestamp: Date.now()
    });
  }

  /**
   * Convert to MongoDB document format
   * @returns {Object} MongoDB document
   */
  toDocument() {
    return {
      mysqlId: this.mysqlId,
      saleId: this.saleId,
      customerId: this.customerId,
      customerContact: this.customerContact,
      saleItems: this.saleItems.map(item => 
        typeof item.toDocument === 'function' ? item.toDocument() : item
      ),
      subTotal: this.subTotal,
      taxAmount: this.taxAmount,
      discountAmount: this.discountAmount,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      changeAmount: this.changeAmount,
      paymentMethod: this.paymentMethod,
      saleDate: this.saleDate,
      timestamp: this.timestamp
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {Sale} Sale instance
   */
  static fromDocument(doc) {
    return new Sale({
      id: doc._id,
      mysqlId: doc.mysqlId,
      saleId: doc.saleId,
      customerId: doc.customerId,
      customerContact: doc.customerContact,
      saleItems: doc.saleItems || [],
      subTotal: doc.subTotal,
      taxAmount: doc.taxAmount,
      discountAmount: doc.discountAmount,
      totalAmount: doc.totalAmount,
      paidAmount: doc.paidAmount,
      changeAmount: doc.changeAmount,
      paymentMethod: doc.paymentMethod,
      saleDate: doc.saleDate,
      timestamp: doc.timestamp
    });
  }

  /**
   * Add item to sale
   * @param {Object} itemData - Item data
   */
  addItem(itemData) {
    const item = {
      mysqlId: itemData.mysqlId,
      productId: itemData.productId,
      productName: itemData.productName,
      category: itemData.category,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      subTotal: itemData.quantity * itemData.unitPrice
    };
    this.saleItems.push(item);
    this.calculateTotals();
  }

  /**
   * Calculate all totals
   */
  calculateTotals() {
    // Calculate subtotal from items
    this.subTotal = this.saleItems.reduce((total, item) => {
      return total + (item.subTotal || (item.quantity * item.unitPrice));
    }, 0);

    // Calculate total amount
    this.totalAmount = this.subTotal + this.taxAmount - this.discountAmount;

    // Calculate change amount
    this.changeAmount = this.paidAmount - this.totalAmount;
  }

  /**
   * Validate sale data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.saleId || this.saleId.trim() === '') {
      errors.push('Sale ID is required');
    }

    if (!this.saleItems || this.saleItems.length === 0) {
      errors.push('Sale must have at least one item');
    }

    if (this.totalAmount < 0) {
      errors.push('Total amount cannot be negative');
    }

    if (this.paidAmount < this.totalAmount) {
      errors.push('Paid amount must be greater than or equal to total amount');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
