const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Assignment = require('./src/models/Assignment');

const publishAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-management');
    console.log('Connected to MongoDB...');

    const result = await Assignment.updateMany(
      { isPublished: false },
      { $set: { isPublished: true } }
    );

    console.log(`Updated ${result.modifiedCount} assignments to published status.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

publishAll();
