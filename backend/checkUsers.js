const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('name email role isActive');
    console.log('Total users:', users.length);
    
    if (users.length > 0) {
      console.log('Users in database:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      });
    } else {
      console.log('No users found in database. Please register first.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
  }
}

checkUsers();