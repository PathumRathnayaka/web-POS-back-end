/**
 * Supplier MongoDB Model
 * Represents supplier information in the WebPOS system
 */
export class Supplier {
  constructor(data = {}) {
    this.id = data.id || null;
    this.mysqlId = data.mysqlId || null;
    this.name = data.name || '';
    this.contact = data.contact || '';
    this.contactPerson = data.contactPerson || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.createdDate = data.createdDate || new Date();
    this.timestamp = data.timestamp || Date.now();
  }

  /**
   * Create a new supplier instance
   * @param {Object} data - Supplier data
   * @returns {Supplier} New supplier instance
   */
  static create(data) {
    return new Supplier({
      mysqlId: data.mysqlId,
      name: data.name,
      contact: data.contact,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
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
      name: this.name,
      contact: this.contact,
      contactPerson: this.contactPerson,
      phone: this.phone,
      email: this.email,
      address: this.address,
      createdDate: this.createdDate,
      timestamp: this.timestamp
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {Supplier} Supplier instance
   */
  static fromDocument(doc) {
    return new Supplier({
      id: doc._id,
      mysqlId: doc.mysqlId,
      name: doc.name,
      contact: doc.contact,
      contactPerson: doc.contactPerson,
      phone: doc.phone,
      email: doc.email,
      address: doc.address,
      createdDate: doc.createdDate,
      timestamp: doc.timestamp
    });
  }

  /**
   * Validate supplier data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Supplier name is required');
    }

    if (!this.contact || this.contact.trim() === '') {
      errors.push('Contact information is required');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push('Invalid phone number format');
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

  /**
   * Check if phone number is valid
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}
