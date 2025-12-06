import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiPhone, FiEye } from 'react-icons/fi';
import { Avatar, Badge, Button } from '../../common';

const StudentList = ({ students, courseId }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {students?.map((student, index) => (
        <div key={student._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar name={student.name} size="lg" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.studentId}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <FiMail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <FiPhone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Department</p>
                <Badge variant="primary">{student.department}</Badge>
              </div>
              <Button variant="secondary" icon={FiEye} onClick={() => navigate(`/faculty/students/${student._id}`)}>
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentList;
