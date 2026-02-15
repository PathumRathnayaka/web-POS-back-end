/**
 * User MongoDB Model
 * Represents user authentication information in the WebPOS system
 */
import bcrypt from 'bcrypt';

export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.password = data.password || ''; // This will be hashed
    this.role = data.role || 'admin';
    this.createdDate = data.createdDate || new Date();
    this.lastLogin = data.lastLogin || null;
  }

  /**
   * Create a new user instance
   * @param {Object} data - User data
   * @returns {User} New user instance
   */
  static create(data) {
    return new User({
      username: data.username,
      password: data.password, // Will be hashed before saving
      role: data.role || 'admin',
      createdDate: data.createdDate || new Date()
    });
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Convert to MongoDB document format
   * @returns {Promise<Object>} MongoDB document
   */
  async toDocument() {
    const hashedPassword = this.password && !this.password.startsWith('$2b$') 
      ? await User.hashPassword(this.password)
      : this.password;

    return {
      username: this.username,
      password: hashedPassword,
      role: this.role,
      createdDate: this.createdDate,
      lastLogin: this.lastLogin
    };
  }

  /**
   * Convert from MongoDB document
   * @param {Object} doc - MongoDB document
   * @returns {User} User instance
   */
  static fromDocument(doc) {
    return new User({
      id: doc._id,
      username: doc.username,
      password: doc.password, // Keep hashed password
      role: doc.role,
      createdDate: doc.createdDate,
      lastLogin: doc.lastLogin
    });
  }

  /**
   * Create safe user object (without password)
   * @returns {Object} User object without password
   */
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      createdDate: this.createdDate,
      lastLogin: this.lastLogin
    };
  }

  /**
   * Validate user data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.username || this.username.trim() === '') {
      errors.push('Username is required');
    }

    if (this.username && this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (!this.password || this.password.trim() === '') {
      errors.push('Password is required');
    }

    if (this.password && this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}



