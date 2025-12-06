import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../../api/student';
import { FiTrendingUp, FiBook, FiAward } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, ProgressBar } from '../../../components/common';

const GradesIndex = () => {
  const { data: grades, isLoading } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: studentAPI.getGrades
  });

  if (isLoading) return <LoadingSpinner />;

  const calculateGPA = () => {
    if (!grades?.courses) return 0;
    const gradePoints = { 'A': 10, 'B': 8, 'C': 6, 'D': 4, 'F': 0 };
    const total = grades.courses.reduce((sum, c) => sum + (gradePoints[c.grade] || 0) * c.credits, 0);
    const credits = grades.courses.reduce((sum, c) => sum + c.credits, 0);
    return credits ? (total / credits).toFixed(2) : 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-600 mt-1">View your academic performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiTrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">GPA</p>
              <p className="text-3xl font-bold text-gray-900">{calculateGPA()}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-3xl font-bold text-gray-900">{grades?.totalCredits || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiAward className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Courses Completed</p>
              <p className="text-3xl font-bold text-gray-900">{grades?.courses?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Courses Grades */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Course Grades</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades?.courses?.map((course, index) => (
                <tr key={course._id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.courseCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.credits}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={course.grade === 'A' ? 'success' : course.grade === 'B' ? 'primary' : 'default'}>
                      {course.grade || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32">
                      <ProgressBar value={course.percentage || 0} color="blue" size="sm" />
                      <p className="text-xs text-gray-600 mt-1">{course.percentage || 0}%</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['A', 'B', 'C', 'D', 'F'].map((grade) => {
            const count = grades?.courses?.filter(c => c.grade === grade).length || 0;
            return (
              <div key={grade} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-600 mt-1">Grade {grade}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default GradesIndex;
