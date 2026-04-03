import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../../../api/faculty';
import { FiSave, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, Button } from '../../../components/common';
import { toast } from 'react-hot-toast';

const Attendance = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['courseStudents', selectedCourse],
    queryFn: () => facultyAPI.getCourseStudents(selectedCourse),
    enabled: !!selectedCourse
  });

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance', selectedCourse, selectedDate],
    queryFn: () => facultyAPI.getAttendance(selectedCourse, selectedDate),
    enabled: !!selectedCourse && !!selectedDate
  });

  React.useEffect(() => {
    if (attendanceRecords) {
      const attendanceMap = {};
      attendanceRecords.forEach(record => {
        attendanceMap[record.student] = record.status;
      });
      setAttendance(attendanceMap);
    }
  }, [attendanceRecords]);

  const saveMutation = useMutation({
    mutationFn: (data) => facultyAPI.markAttendance(selectedCourse, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance', selectedCourse, selectedDate]);
      toast.success('Attendance saved successfully');
    },
    onError: () => toast.error('Failed to save attendance')
  });

  const handleToggle = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students?.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = () => {
    const attendanceData = {
      date: selectedDate,
      records: Object.entries(attendance).map(([studentId, status]) => ({
        student: studentId,
        status
      }))
    };
    saveMutation.mutate(attendanceData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Mark and track student attendance</p>
      </div>

      {/* Selection Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course *</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a course</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date *</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Card>

      {selectedCourse && (
        <>
          {/* Quick Actions */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <div className="flex space-x-3">
                <Button variant="success" size="sm" icon={FiCheckCircle} onClick={() => handleMarkAll('present')}>
                  Mark All Present
                </Button>
                <Button variant="danger" size="sm" icon={FiXCircle} onClick={() => handleMarkAll('absent')}>
                  Mark All Absent
                </Button>
              </div>
            </div>
          </Card>

          {/* Attendance List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Card>
                <div className="space-y-3">
                  {students?.map((student, index) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.rollNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(student._id)}
                          className={`px-6 py-2 rounded-xl font-medium transition-all ${
                            attendance[student._id] === 'present'
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="h-4 w-4" />
                            <span>Present</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(student._id)}
                          className={`px-6 py-2 rounded-xl font-medium transition-all ${
                            attendance[student._id] === 'absent'
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <FiXCircle className="h-4 w-4" />
                            <span>Absent</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-blue-600">
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{students?.length || 0}</p>
                </Card>
                <Card className="border-l-4 border-green-600">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {Object.values(attendance).filter(s => s === 'present').length}
                  </p>
                </Card>
                <Card className="border-l-4 border-red-600">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {Object.values(attendance).filter(s => s === 'absent').length}
                  </p>
                </Card>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  icon={FiSave}
                  onClick={handleSave}
                  disabled={saveMutation.isLoading || Object.keys(attendance).length === 0}
                  className="px-8"
                >
                  {saveMutation.isLoading ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;
