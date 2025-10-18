/**
 * Validation Schemas
 * Joi validation schemas for all entities
 */
import Joi from 'joi';

// Customer validation schemas
export const customerSchemas = {
  create: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    saleId: Joi.string().optional(),
    contact: Joi.string().required().min(1).max(255),
    email: Joi.string().email().optional().allow(''),
    createdDate: Joi.date().optional()
  }),

  update: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    saleId: Joi.string().optional(),
    contact: Joi.string().min(1).max(255).optional(),
    email: Joi.string().email().optional().allow(''),
    createdDate: Joi.date().optional()
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('timestamp', 'createdDate', 'contact').default('timestamp'),
    sortOrder: Joi.number().valid(-1, 1).default(-1)
  }),

  params: Joi.object({
    id: Joi.string().required(),
    mysqlId: Joi.number().integer().positive().required(),
    query: Joi.string().min(1).required()
  })
};

// Sale validation schemas
export const saleSchemas = {
  create: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    saleId: Joi.string().required().min(1).max(255),
    customerId: Joi.number().integer().positive().optional(),
    customerContact: Joi.string().optional().allow(''),
    saleItems: Joi.array().items(
      Joi.object({
        mysqlId: Joi.number().integer().positive().optional(),
        productId: Joi.number().integer().positive().required(),
        productName: Joi.string().required().min(1).max(255),
        category: Joi.string().optional().allow(''),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().required(),
        subTotal: Joi.number().positive().optional()
      })
    ).min(1).required(),
    subTotal: Joi.number().min(0).optional(),
    taxAmount: Joi.number().min(0).optional(),
    discountAmount: Joi.number().min(0).optional(),
    totalAmount: Joi.number().min(0).optional(),
    paidAmount: Joi.number().min(0).required(),
    changeAmount: Joi.number().optional(),
    paymentMethod: Joi.string().optional().allow(''),
    saleDate: Joi.date().optional()
  }),

  update: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    saleId: Joi.string().min(1).max(255).optional(),
    customerId: Joi.number().integer().positive().optional(),
    customerContact: Joi.string().optional().allow(''),
    saleItems: Joi.array().items(
      Joi.object({
        mysqlId: Joi.number().integer().positive().optional(),
        productId: Joi.number().integer().positive().required(),
        productName: Joi.string().required().min(1).max(255),
        category: Joi.string().optional().allow(''),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().required(),
        subTotal: Joi.number().positive().optional()
      })
    ).min(1).optional(),
    subTotal: Joi.number().min(0).optional(),
    taxAmount: Joi.number().min(0).optional(),
    discountAmount: Joi.number().min(0).optional(),
    totalAmount: Joi.number().min(0).optional(),
    paidAmount: Joi.number().min(0).optional(),
    changeAmount: Joi.number().optional(),
    paymentMethod: Joi.string().optional().allow(''),
    saleDate: Joi.date().optional()
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('timestamp', 'saleDate', 'totalAmount').default('timestamp'),
    sortOrder: Joi.number().valid(-1, 1).default(-1),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    customerId: Joi.number().integer().positive().optional()
  }),

  analytics: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }),

  params: Joi.object({
    id: Joi.string().required(),
    mysqlId: Joi.number().integer().positive().required(),
    customerId: Joi.number().integer().positive().required()
  })
};

// Supplier validation schemas
export const supplierSchemas = {
  create: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    name: Joi.string().required().min(1).max(255),
    contact: Joi.string().required().min(1).max(255),
    contactPerson: Joi.string().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().optional().allow(''),
    createdDate: Joi.date().optional()
  }),

  update: Joi.object({
    mysqlId: Joi.number().integer().positive().optional(),
    name: Joi.string().min(1).max(255).optional(),
    contact: Joi.string().min(1).max(255).optional(),
    contactPerson: Joi.string().optional().allow(''),
    phone: Joi.string().optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    address: Joi.string().optional().allow(''),
    createdDate: Joi.date().optional()
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('timestamp', 'createdDate', 'name').default('timestamp'),
    sortOrder: Joi.number().valid(-1, 1).default(-1)
  }),

  params: Joi.object({
    id: Joi.string().required(),
    mysqlId: Joi.number().integer().positive().required(),
    query: Joi.string().min(1).required()
  })
};
