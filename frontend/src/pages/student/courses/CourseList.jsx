// src/pages/student/courses/CourseList.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const CourseList = () => {
  const [courses] = useState([
    {
      id: 1,
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      instructor: 'Dr. Kumar',
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      progress: 75,
      students: 45,
      status: 'active'
    },
    {
      id: 2,
      code: 'CS402',
      name: 'Web Development',
      instructor: 'Prof. Sharma',
      schedule: 'Tue, Thu - 11:00 AM',
      progress: 60,
      students: 38,
      status: 'active'
    },
    {
      id: 3,
      code: 'CS503',
      name: 'Database Management Systems',
      instructor: 'Dr. Patel',
      schedule: 'Mon, Wed - 2:00 PM',
      progress: 85,
      students: 42,
      status: 'active'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">View and manage your enrolled courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/student/courses/${course.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                    {course.code}
                  </span>
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                <p className="text-blue-100 text-sm">{course.instructor}</p>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {course.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {course.students} students
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseList;
