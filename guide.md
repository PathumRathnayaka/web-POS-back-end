# WebPOS Frontend Implementation Guide

This guide provides comprehensive instructions for frontend developers to implement the WebPOS (Web Point of Sale) frontend application that integrates with the backend API.

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Frontend Architecture Recommendations](#frontend-architecture-recommendations)
4. [Implementation Examples](#implementation-examples)
5. [State Management](#state-management)
6. [UI/UX Guidelines](#uiux-guidelines)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Deployment](#deployment)

## 🎯 Overview

The WebPOS backend provides a comprehensive API for managing:
- **Customers**: Customer information and contact details
- **Sales**: Complete sales transactions with items and calculations
- **Suppliers**: Supplier information and management
- **Products**: Product catalog with quantities (legacy support)

### Base URL
```
http://localhost:3000/api
```

### Response Format
All API responses follow this structure:
```javascript
{
  "success": true|false,
  "data": any,           // Response data (null if error)
  "message": string,     // Success/error message
  "pagination": {        // Only for paginated endpoints
    "page": number,
    "limit": number,
    "totalCount": number,
    "totalPages": number
  }
}
```

## 🔗 API Endpoints Reference

### 🧑‍💼 Customers API (`/api/customers`)

#### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "mysqlId": 123,           // Optional: MySQL ID
  "saleId": "SALE001",     // Optional: Sale ID
  "contact": "John Doe",   // Required: Contact name/number
  "email": "john@example.com", // Optional: Email address
  "createdDate": "2024-01-01T00:00:00.000Z" // Optional: Creation date
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "mysqlId": 123,
    "saleId": "SALE001",
    "contact": "John Doe",
    "email": "john@example.com",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "timestamp": 1704067200000
  },
  "message": "Customer created successfully"
}
```

#### Get All Customers
```http
GET /api/customers?page=1&limit=10&sortBy=timestamp&sortOrder=-1
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`timestamp`, `createdDate`, `contact`)
- `sortOrder`: Sort order (`-1` for desc, `1` for asc)

#### Get Customer by ID
```http
GET /api/customers/:id
```

#### Get Customer by MySQL ID
```http
GET /api/customers/mysql/:mysqlId
```

#### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "contact": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Delete Customer
```http
DELETE /api/customers/:id
```

#### Search Customers
```http
GET /api/customers/search/:query?page=1&limit=10
```

### 🛒 Sales API (`/api/sales`)

#### Create Sale
```http
POST /api/sales
Content-Type: application/json

{
  "mysqlId": 456,                    // Optional: MySQL ID
  "saleId": "SALE-2024-001",       // Required: Unique sale ID
  "customerId": 123,                // Optional: Customer ID
  "customerContact": "John Doe",    // Optional: Customer contact
  "saleItems": [                    // Required: Array of sale items
    {
      "mysqlId": 789,               // Optional: MySQL ID
      "productId": 1,               // Required: Product ID
      "productName": "Product 1",   // Required: Product name
      "category": "Electronics",    // Optional: Category
      "quantity": 2,                // Required: Quantity
      "unitPrice": 25.00,           // Required: Unit price
      "subTotal": 50.00             // Optional: Subtotal (auto-calculated)
    }
  ],
  "subTotal": 50.00,               // Optional: Subtotal (auto-calculated)
  "taxAmount": 5.00,               // Optional: Tax amount
  "discountAmount": 2.00,           // Optional: Discount amount
  "totalAmount": 53.00,             // Optional: Total amount (auto-calculated)
  "paidAmount": 60.00,              // Required: Amount paid
  "changeAmount": 7.00,             // Optional: Change amount (auto-calculated)
  "paymentMethod": "cash",          // Optional: Payment method
  "saleDate": "2024-01-01T00:00:00.000Z" // Optional: Sale date
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "mysqlId": 456,
    "saleId": "SALE-2024-001",
    "customerId": 123,
    "customerContact": "John Doe",
    "saleItems": [...],
    "subTotal": 50.00,
    "taxAmount": 5.00,
    "discountAmount": 2.00,
    "totalAmount": 53.00,
    "paidAmount": 60.00,
    "changeAmount": 7.00,
    "paymentMethod": "cash",
    "saleDate": "2024-01-01T00:00:00.000Z",
    "timestamp": 1704067200000
  },
  "message": "Sale created successfully"
}
```

#### Get All Sales
```http
GET /api/sales?page=1&limit=10&sortBy=timestamp&sortOrder=-1&startDate=2024-01-01&endDate=2024-12-31&customerId=123
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`timestamp`, `saleDate`, `totalAmount`)
- `sortOrder`: Sort order (`-1` for desc, `1` for asc)
- `startDate`: Filter sales from this date (ISO string)
- `endDate`: Filter sales until this date (ISO string)
- `customerId`: Filter sales by customer ID

#### Get Sale by ID
```http
GET /api/sales/:id
```

#### Get Sale by MySQL ID
```http
GET /api/sales/mysql/:mysqlId
```

#### Get Sales by Customer
```http
GET /api/sales/customer/:customerId?page=1&limit=10
```

#### Update Sale
```http
PUT /api/sales/:id
Content-Type: application/json

{
  "saleItems": [...],
  "paidAmount": 65.00,
  "paymentMethod": "card"
}
```

#### Delete Sale
```http
DELETE /api/sales/:id
```

#### Get Sales Analytics
```http
GET /api/sales/analytics?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "totalSales": 150,
    "totalRevenue": 15750.00,
    "totalItemsSold": 450,
    "averageSaleAmount": 105.00
  }
}
```

### 🏢 Suppliers API (`/api/suppliers`)

#### Create Supplier
```http
POST /api/suppliers
Content-Type: application/json

{
  "mysqlId": 789,                    // Optional: MySQL ID
  "name": "ABC Electronics",         // Required: Supplier name
  "contact": "Main Office",          // Required: Contact information
  "contactPerson": "John Smith",     // Optional: Contact person
  "phone": "+1234567890",           // Optional: Phone number
  "email": "contact@abc.com",       // Optional: Email address
  "address": "123 Main St, City",   // Optional: Address
  "createdDate": "2024-01-01T00:00:00.000Z" // Optional: Creation date
}
```

#### Get All Suppliers
```http
GET /api/suppliers?page=1&limit=10&sortBy=timestamp&sortOrder=-1
```

#### Get Supplier by ID
```http
GET /api/suppliers/:id
```

#### Get Supplier by MySQL ID
```http
GET /api/suppliers/mysql/:mysqlId
```

#### Update Supplier
```http
PUT /api/suppliers/:id
Content-Type: application/json

{
  "name": "ABC Electronics Ltd",
  "phone": "+1234567891"
}
```

#### Delete Supplier
```http
DELETE /api/suppliers/:id
```

#### Search Suppliers
```http
GET /api/suppliers/search/:query?page=1&limit=10
```

### 📦 Products API (`/api/products`)

#### Get All Products
```http
GET /api/products?page=1&limit=10&sortBy=createdDate&sortOrder=-1
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`createdDate`, `name`, `category`)
- `sortOrder`: Sort order (`-1` for desc, `1` for asc)

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "barcode": "123456789",
      "discount": "10.00",
      "tax": "5.00",
      "sale_price": "150.00",
      "category": "Electronics",
      "expire_date": "2024-12-31T00:00:00.000Z",
      "supplier_id": 1,
      "supplier_name": "Supplier Name",
      "created_date": "2024-01-01T00:00:00.000Z",
      "quantities": {
        "id": "quantity_id",
        "product_id": 1,
        "quantity_size": 100,
        "created_date": "2024-01-01T00:00:00.000Z",
        "updated_date": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Get Products by Category
```http
GET /api/products/category/:category?page=1&limit=10
```

#### Search Products
```http
GET /api/products/search/:query?page=1&limit=10
```

#### Get Product with Quantities
```http
GET /api/products/:id/with-quantities
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "mysqlId": 123,                    // Optional: MySQL ID
  "name": "Product Name",            // Required: Product name
  "barcode": "123456789",           // Required: Barcode
  "discount": "10.00",              // Optional: Discount amount
  "tax": "5.00",                    // Optional: Tax amount
  "salePrice": "150.00",           // Required: Sale price
  "category": "Electronics",        // Optional: Category
  "expireDate": "2024-12-31T00:00:00.000Z", // Optional: Expiry date
  "supplierId": 1,                  // Optional: Supplier ID
  "supplierName": "Supplier Name",   // Optional: Supplier name
  "createdDate": "2024-01-01T00:00:00.000Z" // Optional: Creation date
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "salePrice": "160.00"
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

### 📊 Quantities API (`/api/quantities`)

#### Get All Quantities
```http
GET /api/quantities?page=1&limit=10&sortBy=createdDate&sortOrder=-1
```

#### Get Quantity by Product ID
```http
GET /api/quantities/product/:productId
```

#### Create Quantity
```http
POST /api/quantities
Content-Type: application/json

{
  "productMysqlId": 123,            // Required: Product MySQL ID
  "quantitySize": 100,             // Required: Quantity size
  "createdDate": "2024-01-01T00:00:00.000Z", // Optional: Creation date
  "updatedDate": "2024-01-01T00:00:00.000Z"  // Optional: Update date
}
```

#### Update Quantity
```http
PUT /api/quantities/:id
Content-Type: application/json

{
  "quantitySize": 150
}
```

#### Delete Quantity
```http
DELETE /api/quantities/:id
```

### 🏥 System API

#### Health Check
```http
GET /health
```

**Response:**
```javascript
{
  "status": "ok",
  "message": "WebPOS Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "status": "connected",
    "message": "Database is healthy",
    "collections": [...]
  }
}
```

## 🏗️ Frontend Architecture Recommendations

### 1. Technology Stack

**Recommended Stack:**
- **Framework**: React.js / Vue.js / Angular
- **State Management**: Redux Toolkit / Vuex / NgRx
- **HTTP Client**: Axios / Fetch API
- **UI Library**: Material-UI / Ant Design / Vuetify
- **Styling**: CSS Modules / Styled Components / Tailwind CSS
- **Build Tool**: Vite / Webpack / Create React App

### 2. Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, Modal)
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── customers/      # Customer management pages
│   ├── sales/         # Sales management pages
│   ├── suppliers/     # Supplier management pages
│   └── products/      # Product management pages
├── services/          # API service layer
│   ├── api.js         # Base API configuration
│   ├── customers.js   # Customer API calls
│   ├── sales.js      # Sales API calls
│   ├── suppliers.js  # Supplier API calls
│   └── products.js   # Products API calls
├── store/             # State management
│   ├── slices/       # Redux slices / Vuex modules
│   └── index.js      # Store configuration
├── utils/             # Utility functions
│   ├── constants.js  # App constants
│   ├── helpers.js    # Helper functions
│   └── validation.js # Validation schemas
├── hooks/             # Custom React hooks (if using React)
└── styles/           # Global styles
```

## 💻 Implementation Examples

### 1. API Service Layer

**Base API Configuration (`services/api.js`):**
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

**Customer Service (`services/customers.js`):**
```javascript
import api from './api';

export const customerService = {
  // Create customer
  createCustomer: (customerData) => 
    api.post('/customers', customerData),

  // Get all customers
  getCustomers: (params = {}) => 
    api.get('/customers', { params }),

  // Get customer by ID
  getCustomerById: (id) => 
    api.get(`/customers/${id}`),

  // Get customer by MySQL ID
  getCustomerByMysqlId: (mysqlId) => 
    api.get(`/customers/mysql/${mysqlId}`),

  // Update customer
  updateCustomer: (id, customerData) => 
    api.put(`/customers/${id}`, customerData),

  // Delete customer
  deleteCustomer: (id) => 
    api.delete(`/customers/${id}`),

  // Search customers
  searchCustomers: (query, params = {}) => 
    api.get(`/customers/search/${query}`, { params }),
};
```

**Sales Service (`services/sales.js`):**
```javascript
import api from './api';

export const salesService = {
  // Create sale
  createSale: (saleData) => 
    api.post('/sales', saleData),

  // Get all sales
  getSales: (params = {}) => 
    api.get('/sales', { params }),

  // Get sale by ID
  getSaleById: (id) => 
    api.get(`/sales/${id}`),

  // Get sales by customer
  getSalesByCustomer: (customerId, params = {}) => 
    api.get(`/sales/customer/${customerId}`, { params }),

  // Update sale
  updateSale: (id, saleData) => 
    api.put(`/sales/${id}`, saleData),

  // Delete sale
  deleteSale: (id) => 
    api.delete(`/sales/${id}`),

  // Get sales analytics
  getSalesAnalytics: (params = {}) => 
    api.get('/sales/analytics', { params }),
};
```

### 2. React Component Example

**Customer List Component:**
```jsx
import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customers';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await customerService.getCustomers({
        page,
        limit: pagination.limit,
        sortBy: 'timestamp',
        sortOrder: -1
      });
      
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.error || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePageChange = (newPage) => {
    fetchCustomers(newPage);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Customers</h2>
      <div className="customer-list">
        {customers.map(customer => (
          <div key={customer.id} className="customer-card">
            <h3>{customer.contact}</h3>
            <p>Email: {customer.email}</p>
            <p>Sale ID: {customer.saleId}</p>
            <p>Created: {new Date(customer.createdDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button 
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CustomerList;
```

### 3. Sale Form Component

**Sale Creation Form:**
```jsx
import React, { useState, useEffect } from 'react';
import { salesService } from '../services/sales';
import { customerService } from '../services/customers';
import { productService } from '../services/products';

const SaleForm = () => {
  const [formData, setFormData] = useState({
    saleId: '',
    customerId: '',
    customerContact: '',
    saleItems: [],
    taxAmount: 0,
    discountAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash'
  });
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load customers and products
    const loadData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts()
        ]);
        setCustomers(customersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  const addSaleItem = () => {
    setFormData(prev => ({
      ...prev,
      saleItems: [...prev.saleItems, {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        subTotal: 0
      }]
    }));
  };

  const updateSaleItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.saleItems];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate subtotal
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].subTotal = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, saleItems: newItems };
    });
  };

  const calculateTotals = () => {
    const subTotal = formData.saleItems.reduce((sum, item) => sum + item.subTotal, 0);
    const totalAmount = subTotal + formData.taxAmount - formData.discountAmount;
    const changeAmount = formData.paidAmount - totalAmount;
    
    return { subTotal, totalAmount, changeAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const totals = calculateTotals();
      const saleData = {
        ...formData,
        ...totals,
        saleDate: new Date().toISOString()
      };
      
      const response = await salesService.createSale(saleData);
      console.log('Sale created:', response);
      
      // Reset form or redirect
      setFormData({
        saleId: '',
        customerId: '',
        customerContact: '',
        saleItems: [],
        taxAmount: 0,
        discountAmount: 0,
        paidAmount: 0,
        paymentMethod: 'cash'
      });
    } catch (error) {
      console.error('Failed to create sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="sale-form">
      <h2>Create New Sale</h2>
      
      {/* Sale ID */}
      <div className="form-group">
        <label>Sale ID:</label>
        <input
          type="text"
          value={formData.saleId}
          onChange={(e) => setFormData(prev => ({ ...prev, saleId: e.target.value }))}
          required
        />
      </div>

      {/* Customer Selection */}
      <div className="form-group">
        <label>Customer:</label>
        <select
          value={formData.customerId}
          onChange={(e) => {
            const customer = customers.find(c => c.mysqlId === parseInt(e.target.value));
            setFormData(prev => ({
              ...prev,
              customerId: e.target.value,
              customerContact: customer?.contact || ''
            }));
          }}
        >
          <option value="">Select Customer</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.mysqlId}>
              {customer.contact}
            </option>
          ))}
        </select>
      </div>

      {/* Sale Items */}
      <div className="sale-items">
        <h3>Sale Items</h3>
        {formData.saleItems.map((item, index) => (
          <div key={index} className="sale-item">
            <select
              value={item.productId}
              onChange={(e) => {
                const product = products.find(p => p.id === parseInt(e.target.value));
                updateSaleItem(index, 'productId', e.target.value);
                updateSaleItem(index, 'productName', product?.name || '');
                updateSaleItem(index, 'unitPrice', parseFloat(product?.sale_price || 0));
              }}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.sale_price}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value))}
              min="1"
            />
            
            <input
              type="number"
              placeholder="Unit Price"
              value={item.unitPrice}
              onChange={(e) => updateSaleItem(index, 'unitPrice', parseFloat(e.target.value))}
              step="0.01"
            />
            
            <span>Subtotal: ${item.subTotal.toFixed(2)}</span>
          </div>
        ))}
        
        <button type="button" onClick={addSaleItem}>
          Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="totals">
        <div>Subtotal: ${totals.subTotal.toFixed(2)}</div>
        <div>
          <label>Tax Amount:</label>
          <input
            type="number"
            value={formData.taxAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) }))}
            step="0.01"
          />
        </div>
        <div>
          <label>Discount Amount:</label>
          <input
            type="number"
            value={formData.discountAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) }))}
            step="0.01"
          />
        </div>
        <div>Total Amount: ${totals.totalAmount.toFixed(2)}</div>
        <div>
          <label>Paid Amount:</label>
          <input
            type="number"
            value={formData.paidAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) }))}
            step="0.01"
            required
          />
        </div>
        <div>Change Amount: ${totals.changeAmount.toFixed(2)}</div>
      </div>

      {/* Payment Method */}
      <div className="form-group">
        <label>Payment Method:</label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="mobile">Mobile Payment</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Sale'}
      </button>
    </form>
  );
};

export default SaleForm;
```

## 🔄 State Management

### Redux Toolkit Example

**Customer Slice (`store/slices/customersSlice.js`):**
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '../../services/customers';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params = {}) => {
    const response = await customerService.getCustomers(params);
    return response;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData) => {
    const response = await customerService.createCustomer(customerData);
    return response;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }) => {
    const response = await customerService.updateCustomer(id, customerData);
    return response;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id) => {
    await customerService.deleteCustomer(id);
    return id;
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.data);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          customer => customer.id === action.payload.data.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload.data;
        }
      })
      
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          customer => customer.id !== action.payload
        );
      });
  }
});

export const { clearError, setPage } = customersSlice.actions;
export default customersSlice.reducer;
```

## 🎨 UI/UX Guidelines

### 1. Design Principles

- **Consistency**: Use consistent colors, fonts, and spacing
- **Accessibility**: Ensure WCAG 2.1 compliance
- **Responsiveness**: Mobile-first design approach
- **Performance**: Optimize for fast loading and smooth interactions

### 2. Color Scheme

```css
:root {
  /* Primary Colors */
  --primary-color: #1976d2;
  --primary-light: #42a5f5;
  --primary-dark: #1565c0;
  
  /* Secondary Colors */
  --secondary-color: #dc004e;
  --secondary-light: #ff5983;
  --secondary-dark: #9a0036;
  
  /* Neutral Colors */
  --background: #f5f5f5;
  --surface: #ffffff;
  --text-primary: #212121;
  --text-secondary: #757575;
  
  /* Status Colors */
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --info: #2196f3;
}
```

### 3. Component Library

**Button Component:**
```jsx
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  children, 
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success'
  };
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

### 4. Layout Components

**Dashboard Layout:**
```jsx
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>WebPOS System</h1>
        <nav className="dashboard-nav">
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/sales">Sales</NavLink>
          <NavLink to="/suppliers">Suppliers</NavLink>
          <NavLink to="/products">Products</NavLink>
        </nav>
      </header>
      
      <main className="dashboard-main">
        {children}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2024 WebPOS System</p>
      </footer>
    </div>
  );
};
```

## ⚠️ Error Handling

### 1. Global Error Handler

```javascript
// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'Server error occurred',
      status: error.response.status,
      type: 'server'
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      type: 'network'
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      type: 'client'
    };
  }
};

// Error boundary component (React)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Toast Notifications

```javascript
// Toast notification system
export const toast = {
  success: (message) => {
    // Implement success toast
    console.log('Success:', message);
  },
  error: (message) => {
    // Implement error toast
    console.error('Error:', message);
  },
  warning: (message) => {
    // Implement warning toast
    console.warn('Warning:', message);
  },
  info: (message) => {
    // Implement info toast
    console.info('Info:', message);
  }
};
```

## 🧪 Testing

### 1. Unit Tests

```javascript
// Customer service tests
import { customerService } from '../services/customers';

describe('Customer Service', () => {
  beforeEach(() => {
    // Mock API calls
    jest.clearAllMocks();
  });

  test('should create customer successfully', async () => {
    const mockCustomer = {
      contact: 'John Doe',
      email: 'john@example.com'
    };
    
    const mockResponse = {
      success: true,
      data: { id: '1', ...mockCustomer },
      message: 'Customer created successfully'
    };
    
    // Mock the API call
    jest.spyOn(customerService, 'createCustomer').mockResolvedValue(mockResponse);
    
    const result = await customerService.createCustomer(mockCustomer);
    
    expect(result.success).toBe(true);
    expect(result.data.contact).toBe('John Doe');
  });

  test('should handle API errors', async () => {
    const mockError = {
      success: false,
      error: 'Validation failed'
    };
    
    jest.spyOn(customerService, 'createCustomer').mockRejectedValue(mockError);
    
    await expect(customerService.createCustomer({})).rejects.toEqual(mockError);
  });
});
```

### 2. Integration Tests

```javascript
// API integration tests
describe('API Integration', () => {
  test('should fetch customers from API', async () => {
    const response = await fetch('http://localhost:3000/api/customers');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

## 🚀 Deployment

### 1. Environment Configuration

```javascript
// Environment configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://your-api-domain.com/api',
    DEBUG: false
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### 2. Build Configuration

**Vite Configuration (`vite.config.js`):**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          api: ['./src/services']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### 3. Docker Configuration

**Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 Additional Resources

### 1. Useful Libraries

- **Date Handling**: `date-fns` or `moment.js`
- **Form Validation**: `yup` or `zod`
- **Charts**: `recharts` or `chart.js`
- **Icons**: `react-icons` or `heroicons`
- **Notifications**: `react-toastify` or `notistack`

### 2. Best Practices

1. **API Calls**: Always handle loading states and errors
2. **Forms**: Implement proper validation and user feedback
3. **Performance**: Use React.memo, useMemo, useCallback where appropriate
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Security**: Sanitize user inputs and validate data on both client and server

### 3. Common Patterns

- **Loading States**: Show spinners or skeletons during API calls
- **Error Boundaries**: Catch and handle React errors gracefully
- **Optimistic Updates**: Update UI immediately, rollback on error
- **Debouncing**: Delay API calls for search inputs
- **Pagination**: Implement infinite scroll or page-based navigation

---

## 🎯 Quick Start Checklist

- [ ] Set up project with chosen framework
- [ ] Install and configure HTTP client (Axios)
- [ ] Create API service layer
- [ ] Implement authentication (if needed)
- [ ] Create reusable UI components
- [ ] Implement CRUD operations for all entities
- [ ] Add form validation and error handling
- [ ] Implement state management
- [ ] Add loading states and user feedback
- [ ] Write unit and integration tests
- [ ] Configure build and deployment
- [ ] Test with real backend API

This guide provides a comprehensive foundation for implementing the WebPOS frontend. Adapt the examples to your chosen technology stack and specific requirements.
