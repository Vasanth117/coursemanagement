import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiCalendar } from 'react-icons/fi';
import { Badge, ProgressBar } from '../../common';

const CourseCard = ({ course, showProgress = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up">
      <div className="flex justify-between items-start mb-4">
        <Badge variant={course.status === 'active' ? 'success' : 'default'}>
          {course.status}
        </Badge>
        <span className="text-sm font-semibold text-blue-600">{course.courseCode}</span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
      
      {showProgress && course.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
          </div>
          <ProgressBar value={course.progress} color="blue" />
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-2">
          <FiUsers className="h-4 w-4" />
          <span>{course.enrolledStudents || 0} students</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiBook className="h-4 w-4" />
          <span>{course.credits} Credits</span>
        </div>
      </div>

      {course.schedule && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <FiCalendar className="h-4 w-4" />
          <span>{course.schedule.days?.join(', ')} • {course.schedule.time}</span>
        </div>
      )}

      <Link
        to={`/student/courses/${course._id}`}
        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        View Details
      </Link>
    </div>
  );
};

export default CourseCard;
