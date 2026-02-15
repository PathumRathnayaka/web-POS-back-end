/**
 * Seed Admin User
 * Creates the default admin user if it doesn't exist
 */
import databaseManager from '../config/database.js';
import { UserService } from '../services/UserService.js';

export async function seedAdminUser() {
  try {
    const userService = new UserService();
    const collection = userService.getCollection();

    // Check if admin user already exists
    const existingAdmin = await collection.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      password: '12345678',
      role: 'admin'
    };

    const result = await userService.createUser(adminData);
    console.log('✅ Admin user created successfully:', result.data.username);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
}



