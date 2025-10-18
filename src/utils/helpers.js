/**
 * Utility Functions
 * Common utility functions for the application
 */

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {Object} pagination - Pagination info
 * @returns {Object} Formatted response
 */
export const formatResponse = (success, data = null, message = null, pagination = null) => {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (pagination) response.pagination = pagination;
  
  return response;
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Format date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} ISO date string
 */
export const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Calculate pagination info
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total items count
 * @returns {Object} Pagination info
 */
export const calculatePagination = (page, limit, totalCount) => {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasNext: page < Math.ceil(totalCount / limit),
    hasPrev: page > 1
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Round to specified decimal places
 * @param {number} number - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded number
 */
export const roundToDecimals = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return roundToDecimals((value / total) * 100);
};

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};
