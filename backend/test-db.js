const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testDatabaseConnection = async () => {
  console.log('🔍 Testing Database Connection...');
  console.log('MongoDB URI:', process.env.MONGO_URI);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected Successfully!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database Connection Closed');
    
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    process.exit(1);
  }
};

// Run the test
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };