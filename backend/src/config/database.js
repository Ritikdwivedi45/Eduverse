const mongoose = require('mongoose');
const config = require('./dotenv');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create initial admin user if not exists
    await createInitialAdmin();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createInitialAdmin = async () => {
  try {
    const User = require('../models/User.model');
    const adminEmail = config.ADMIN_EMAIL;
    
    const adminExists = await User.findOne({ email: adminEmail, role: 'admin' });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 10);
      
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        status: 'active'
      });
      
      console.log('Initial admin user created');
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

module.exports = connectDatabase;