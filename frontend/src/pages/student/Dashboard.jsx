import React from 'react';
import { useSelector } from 'react-redux';
import StudentEnrollmentDashboard from '../../components/enrollment/StudentEnrollmentDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your course enrollments and learning progress</p>
      </div>
      
      <StudentEnrollmentDashboard />
    </div>
  );
};

export default Dashboard;
