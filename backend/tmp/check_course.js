const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Course = require('../src/models/Course');

async function checkCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const courseId = '69b5336940c16022e441c919';
    const course = await Course.findById(courseId).populate('faculty');
    
    if (!course) {
      console.log('Course not found');
    } else {
      console.log('Course found:');
      console.log('ID:', course._id);
      console.log('Title:', course.title);
      console.log('Faculty ID:', course.faculty ? course.faculty._id : 'None');
      console.log('Faculty Name:', course.faculty ? course.faculty.name : 'N/A');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourse();
