import React from 'react';
import FacultyEnrollmentDashboard from '../../components/enrollment/FacultyEnrollmentDashboard';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time student enrollment tracking</p>
      </div>
      
      <FacultyEnrollmentDashboard />
    </div>
  );
};

export default Dashboard;
