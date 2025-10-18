/**
 * Product MongoDB Model
 * Represents product information in the WebPOS system
 */
export class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.mysqlId = data.mysqlId || data.mysql_id || null;
    this.name = data.name || '';
    this.barcode = data.barcode || '';
    this.discount = data.discount || '0.00';
    this.tax = data.tax || '0.00';
    this.salePrice = data.salePrice || data.sale_price || '0.00';
    this.category = data.category || '';
    this.expireDate = data.expireDate || data.expire_date || null;
    this.supplierId = data.supplierId || data.supplier_id || null;
    this.supplierName = data.supplierName || data.supplier_name || '';
    this.createdDate = data.createdDate || data.created_date || new Date();
  }

  /**
   * Create a new product instance
   * @param {Object} data - Product data
   * @returns {Product} New product instance
   */
  static create(data) {
    return new Product({
      mysqlId: data.mysqlId,
      name: data.name,
      barcode: data.barcode,
      discount: data.discount,
      tax: data.tax,
      salePrice: data.salePrice,
      category: data.category,
      expireDate: data.expireDate,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      createdDate: data.createdDate || new Date()
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
      barcode: this.barcode,
      discount: this.discount,
      tax: this.tax,
      salePrice: this.salePrice,
      category: this.category,
      expireDate: this.expireDate,
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      createdDate: this.createdDate
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {Product} Product instance
   */
  static fromDocument(doc) {
    return new Product({
      id: doc._id,
      mysqlId: doc.mysqlId,
      name: doc.name,
      barcode: doc.barcode,
      discount: doc.discount,
      tax: doc.tax,
      salePrice: doc.salePrice,
      category: doc.category,
      expireDate: doc.expireDate,
      supplierId: doc.supplierId,
      supplierName: doc.supplierName,
      createdDate: doc.createdDate
    });
  }

  /**
   * Format product with quantity for API response
   * @param {Object} quantity - Quantity data
   * @returns {Object} Formatted product with quantity
   */
  formatWithQuantity(quantity) {
    return {
      id: this.mysqlId || this.id,
      name: this.name,
      barcode: this.barcode,
      discount: this.discount,
      tax: this.tax,
      sale_price: this.salePrice,
      category: this.category,
      expire_date: this.expireDate,
      supplier_id: this.supplierId,
      supplier_name: this.supplierName,
      created_date: this.createdDate,
      quantities: quantity ? {
        id: quantity._id,
        product_id: this.mysqlId || this.id,
        quantity_size: quantity.quantitySize || quantity.quantity_size,
        created_date: quantity.createdDate || quantity.created_date,
        updated_date: quantity.updatedDate || quantity.updated_date
      } : null
    };
  }

  /**
   * Validate product data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (!this.barcode || this.barcode.trim() === '') {
      errors.push('Barcode is required');
    }

    if (!this.salePrice || parseFloat(this.salePrice) < 0) {
      errors.push('Sale price must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
