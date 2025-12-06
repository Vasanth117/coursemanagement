import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { Badge } from '../../common';
import { formatDate } from '../../../utils/formatters';

const AssignmentCard = ({ assignment }) => {
  const getStatusBadge = () => {
    if (assignment.grade !== undefined) return { variant: 'success', label: 'Graded' };
    if (assignment.submitted) return { variant: 'primary', label: 'Submitted' };
    if (new Date(assignment.dueDate) < new Date()) return { variant: 'danger', label: 'Overdue' };
    return { variant: 'warning', label: 'Pending' };
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{assignment.course?.title}</p>
      
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <FiClock className="h-4 w-4" />
          <span>Due: {formatDate(assignment.dueDate)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiFileText className="h-4 w-4" />
          <span>{assignment.totalMarks} marks</span>
        </div>
        {assignment.grade !== undefined && (
          <div className="flex items-center space-x-2 text-green-600">
            <FiCheckCircle className="h-4 w-4" />
            <span className="font-medium">Grade: {assignment.grade}/{assignment.totalMarks}</span>
          </div>
        )}
      </div>

      <Link
        to={`/student/assignments/${assignment._id}`}
        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        View Details
      </Link>
    </div>
  );
};

export default AssignmentCard;
