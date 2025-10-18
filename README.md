# WebPOS Backend API

A well-structured Node.js backend for WebPOS (Web Point of Sale) system with MongoDB integration, featuring customers, sales, suppliers, and product management.

## 🏗️ Project Structure

```
src/
├── config/
│   └── database.js          # Database connection and configuration
├── controllers/
│   ├── CustomerController.js
│   ├── SaleController.js
│   └── SupplierController.js
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   ├── security.js          # Security and performance middleware
│   └── validation.js        # Request validation middleware
├── models/
│   ├── Customer.js          # Customer MongoDB model
│   ├── Sale.js             # Sale MongoDB model
│   ├── SaleItem.js         # Sale item model
│   └── Supplier.js         # Supplier MongoDB model
├── routes/
│   ├── customerRoutes.js    # Customer API routes
│   ├── saleRoutes.js       # Sale API routes
│   └── supplierRoutes.js   # Supplier API routes
├── services/
│   ├── CustomerService.js   # Customer business logic
│   ├── SaleService.js      # Sale business logic
│   └── SupplierService.js  # Supplier business logic
├── utils/
│   └── helpers.js          # Utility functions
└── validators/
    └── schemas.js          # Joi validation schemas
```

## 🚀 Features

### Core Entities
- **Customers**: Customer management with contact information
- **Sales**: Complete sales transactions with items and calculations
- **Suppliers**: Supplier information and management
- **Products**: Product catalog with quantities (legacy support)

### Key Features
- ✅ RESTful API design
- ✅ MongoDB integration with proper indexing
- ✅ Input validation using Joi
- ✅ Error handling and logging
- ✅ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Pagination support
- ✅ Search functionality
- ✅ Analytics endpoints
- ✅ Performance optimization
- ✅ Graceful shutdown handling

## 📋 API Endpoints

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers (paginated)
- `GET /api/customers/:id` - Get customer by ID
- `GET /api/customers/mysql/:mysqlId` - Get customer by MySQL ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/search/:query` - Search customers

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get all sales (paginated, filtered)
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/mysql/:mysqlId` - Get sale by MySQL ID
- `GET /api/sales/customer/:customerId` - Get sales by customer
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/analytics` - Get sales analytics

### Suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers` - Get all suppliers (paginated)
- `GET /api/suppliers/:id` - Get supplier by ID
- `GET /api/suppliers/mysql/:mysqlId` - Get supplier by MySQL ID
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/suppliers/search/:query` - Search suppliers

### Products (Legacy Support)
- `GET /api/products` - Get all products with quantities
- `GET /api/products/:id` - Get product by ID
- `GET /api/debug` - Debug endpoint for database structure

### System
- `GET /health` - Health check endpoint

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file with:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   
   # Legacy mode (original index.js)
   npm run legacy
   ```

## 📊 Database Collections

### Customers Collection
```javascript
{
  _id: ObjectId,
  mysqlId: Number,
  saleId: String,
  contact: String,
  email: String,
  createdDate: Date,
  timestamp: Number
}
```

### Sales Collection
```javascript
{
  _id: ObjectId,
  mysqlId: Number,
  saleId: String,
  customerId: Number,
  customerContact: String,
  saleItems: [{
    mysqlId: Number,
    productId: Number,
    productName: String,
    category: String,
    quantity: Number,
    unitPrice: Number,
    subTotal: Number
  }],
  subTotal: Number,
  taxAmount: Number,
  discountAmount: Number,
  totalAmount: Number,
  paidAmount: Number,
  changeAmount: Number,
  paymentMethod: String,
  saleDate: Date,
  timestamp: Number
}
```

### Suppliers Collection
```javascript
{
  _id: ObjectId,
  mysqlId: Number,
  name: String,
  contact: String,
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  createdDate: Date,
  timestamp: Number
}
```

## 🔧 Configuration

### Database Indexes
The application automatically creates indexes for optimal performance:
- Customers: mysqlId, saleId, contact, timestamp
- Sales: mysqlId, saleId, customerId, saleDate, timestamp
- Suppliers: mysqlId, name, contact, timestamp
- Products: mysqlId, name, barcode, category, supplierId
- Quantities: productMysqlId, productId

### Security Features
- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Error handling with proper status codes

## 📈 Performance Features

- **Compression**: Gzip compression for responses
- **Database Indexing**: Optimized indexes for queries
- **Pagination**: Efficient pagination for large datasets
- **Connection Pooling**: MongoDB connection pooling
- **Error Handling**: Comprehensive error handling
- **Logging**: Request logging with Morgan

## 🔍 Usage Examples

### Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "John Doe",
    "email": "john@example.com"
  }'
```

### Create a Sale
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "SALE001",
    "customerId": 1,
    "saleItems": [{
      "productId": 1,
      "productName": "Product 1",
      "quantity": 2,
      "unitPrice": 10.00
    }],
    "paidAmount": 20.00,
    "paymentMethod": "cash"
  }'
```

### Get Sales Analytics
```bash
curl http://localhost:3000/api/sales/analytics?startDate=2024-01-01&endDate=2024-12-31
```

## 🚨 Error Handling

The API returns consistent error responses:
```javascript
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 🔄 Migration from Legacy

The original `index.js` is preserved as `legacy` mode. The new structure provides:
- Better organization and maintainability
- Enhanced security and performance
- Comprehensive validation
- Proper error handling
- Scalable architecture

## 📝 License

This project is part of the WebPOS system backend implementation.
