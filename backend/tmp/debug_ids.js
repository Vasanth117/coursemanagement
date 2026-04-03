const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Course = require('../src/models/Course');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const facultyId = '69b532e340c16022e441c8fc';
    const user = await User.findById(facultyId);
    
    if (!user) {
      console.log('User not found:', facultyId);
    } else {
      console.log('User found:', user.name, 'Role:', user.role);
    }

    const courses = await Course.find({ faculty: facultyId });
    console.log('Courses owned by this faculty:', courses.length);
    courses.forEach(c => {
      console.log(`- ${c.code}: ${c.title} (${c._id})`);
    });

    const specificCourseId = '69b5336940c16022e441c919';
    const specificCourse = await Course.findById(specificCourseId);
    if (specificCourse) {
      console.log('Specific Course owner:', specificCourse.faculty);
    } else {
      console.log('Specific Course not found:', specificCourseId);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debug();
