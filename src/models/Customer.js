/**
 * Customer MongoDB Model
 * Represents customer information in the WebPOS system
 */
export class Customer {
  constructor(data = {}) {
    this.id = data.id || null;
    this.mysqlId = data.mysqlId || null;
    this.saleId = data.saleId || null;
    this.contact = data.contact || '';
    this.email = data.email || '';
    this.createdDate = data.createdDate || new Date();
    this.timestamp = data.timestamp || Date.now();
  }

  /**
   * Create a new customer instance
   * @param {Object} data - Customer data
   * @returns {Customer} New customer instance
   */
  static create(data) {
    return new Customer({
      mysqlId: data.mysqlId,
      saleId: data.saleId,
      contact: data.contact,
      email: data.email,
      createdDate: data.createdDate || new Date(),
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
      contact: this.contact,
      email: this.email,
      createdDate: this.createdDate,
      timestamp: this.timestamp
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {Customer} Customer instance
   */
  static fromDocument(doc) {
    return new Customer({
      id: doc._id,
      mysqlId: doc.mysqlId,
      saleId: doc.saleId,
      contact: doc.contact,
      email: doc.email,
      createdDate: doc.createdDate,
      timestamp: doc.timestamp
    });
  }

  /**
   * Validate customer data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.contact || this.contact.trim() === '') {
      errors.push('Contact is required');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
