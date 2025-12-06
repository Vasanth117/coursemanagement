import React from 'react';
import { FiCalendar, FiUser, FiMapPin } from 'react-icons/fi';
import { Badge } from '../../common';

const EnrollmentCard = ({ course, onEnroll }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all animate-slide-up">
      <div className="flex justify-between items-start mb-4">
        <Badge variant="primary">{course.courseCode}</Badge>
        <span className="text-sm font-semibold text-blue-600">{course.credits} Credits</span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <FiUser className="h-4 w-4" />
          <span>{course.faculty?.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiCalendar className="h-4 w-4" />
          <span>{course.schedule?.days?.join(', ')} • {course.schedule?.time}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiMapPin className="h-4 w-4" />
          <span>{course.schedule?.room}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-gray-600">Available Seats</span>
        <span className="font-bold text-gray-900">
          {course.maxStudents - (course.enrolledStudents?.length || 0)} / {course.maxStudents}
        </span>
      </div>

      <button
        onClick={() => onEnroll(course._id)}
        disabled={course.enrolledStudents?.length >= course.maxStudents}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {course.enrolledStudents?.length >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
      </button>
    </div>
  );
};

export default EnrollmentCard;
