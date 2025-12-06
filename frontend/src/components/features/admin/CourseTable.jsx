import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiTrash, FiCheckCircle, FiUsers } from 'react-icons/fi';
import { Badge, Avatar } from '../../common';

const CourseTable = ({ courses, onDelete, onApprove }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses?.map((course, index) => (
            <tr key={course._id} className="hover:bg-gray-50 transition animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <td className="px-6 py-4">
                <div>
                  <p className="font-semibold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.courseCode} • {course.credits} Credits</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Avatar name={course.faculty?.name} size="sm" />
                  <span className="text-sm text-gray-900">{course.faculty?.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <FiUsers className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{course.enrolledStudents?.length || 0}/{course.maxStudents}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={course.status === 'active' ? 'success' : course.status === 'pending' ? 'warning' : 'default'}>
                  {course.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button onClick={() => navigate(`/admin/courses/${course._id}`)} className="text-blue-600 hover:text-blue-800">
                    <FiEye className="w-5 h-5" />
                  </button>
                  {course.status === 'pending' && onApprove && (
                    <button onClick={() => onApprove(course._id)} className="text-green-600 hover:text-green-800">
                      <FiCheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(course._id)} className="text-red-600 hover:text-red-800">
                      <FiTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
