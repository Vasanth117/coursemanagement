import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { Badge, ProgressBar } from '../../common';

const GradeCard = ({ course }) => {
  const getGradeBadge = (grade) => {
    if (grade === 'A') return 'success';
    if (grade === 'B') return 'primary';
    return 'default';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all animate-slide-up">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.courseCode}</p>
        </div>
        <Badge variant={getGradeBadge(course.grade)}>{course.grade || 'N/A'}</Badge>
      </div>

      {course.percentage !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Score</span>
            <span className="text-sm font-bold text-gray-900">{course.percentage}%</span>
          </div>
          <ProgressBar value={course.percentage} color="blue" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Credits</p>
          <p className="font-bold text-gray-900">{course.credits}</p>
        </div>
        <div>
          <p className="text-gray-600">Grade Points</p>
          <p className="font-bold text-gray-900">{course.gradePoints || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;
