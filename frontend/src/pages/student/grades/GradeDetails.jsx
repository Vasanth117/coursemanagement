import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tantml:react-query';
import { studentAPI } from '../../../api/student';
import { FiArrowLeft, FiTrendingUp } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, ProgressBar } from '../../../components/common';
import { useNavigate } from 'react-router-dom';

const GradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: gradeDetails, isLoading } = useQuery({
    queryKey: ['gradeDetails', id],
    queryFn: () => studentAPI.getGradeDetails(id)
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/student/grades')} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{gradeDetails?.course?.title}</h1>
          <p className="text-gray-600 mt-1">{gradeDetails?.course?.courseCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Final Grade</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{gradeDetails?.finalGrade || 'N/A'}</p>
        </Card>
        <Card className="border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Percentage</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{gradeDetails?.percentage || 0}%</p>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <p className="text-sm text-gray-600">Grade Points</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{gradeDetails?.gradePoints || 0}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Breakdown</h2>
        <div className="space-y-4">
          {gradeDetails?.breakdown?.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-sm text-gray-600">{item.score}/{item.total}</span>
              </div>
              <ProgressBar value={(item.score / item.total) * 100} color="blue" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GradeDetails;
