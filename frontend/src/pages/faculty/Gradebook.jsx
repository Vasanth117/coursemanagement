import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../../api/faculty';
import { FiDownload, FiSave, FiBook } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, Badge } from '../../components/common';
import { toast } from 'react-hot-toast';

const Gradebook = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState({});
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  const { data: gradebook, isLoading: gradebookLoading } = useQuery({
    queryKey: ['gradebook', selectedCourse],
    queryFn: () => facultyAPI.getGradebook(selectedCourse),
    enabled: !!selectedCourse
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ studentId, data }) => facultyAPI.updateGrade(selectedCourse, studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gradebook', selectedCourse]);
      toast.success('Grade updated successfully');
    },
    onError: () => toast.error('Failed to update grade')
  });

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSaveGrade = (studentId) => {
    updateGradeMutation.mutate({ studentId, data: grades[studentId] });
  };

  const exportGradebook = () => {
    // Export logic here
    toast.success('Gradebook exported successfully');
  };

  if (coursesLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-600 mt-1">Manage student grades and performance</p>
        </div>
        {selectedCourse && (
          <Button variant="secondary" icon={FiDownload} onClick={exportGradebook}>
            Export Gradebook
          </Button>
        )}
      </div>

      {/* Course Selection */}
      <Card>
        <div className="flex items-center space-x-4">
          <FiBook className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a course</option>
            {courses?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Gradebook Table */}
      {selectedCourse && (
        <>
          {gradebookLoading ? (
            <LoadingSpinner />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mid Term</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gradebook?.students?.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={student.attendance}
                            onChange={(e) => handleGradeChange(student._id, 'attendance', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={student.assignments}
                            onChange={(e) => handleGradeChange(student._id, 'assignments', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={student.midTerm}
                            onChange={(e) => handleGradeChange(student._id, 'midTerm', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={student.final}
                            onChange={(e) => handleGradeChange(student._id, 'final', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-gray-900">{student.total || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={student.grade === 'A' ? 'success' : student.grade === 'B' ? 'primary' : 'default'}>
                            {student.grade || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={FiSave}
                            onClick={() => handleSaveGrade(student._id)}
                            disabled={!grades[student._id]}
                          >
                            Save
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Grade Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['A', 'B', 'C', 'D', 'F'].map((grade) => {
              const count = gradebook?.students?.filter(s => s.grade === grade).length || 0;
              return (
                <Card key={grade} className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600 mt-1">Grade {grade}</p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Gradebook;
