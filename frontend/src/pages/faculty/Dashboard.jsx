import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { facultyAPI } from '../../api/faculty';
import { FiBook, FiUsers, FiFileText, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, ErrorMessage } from '../../components/common';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['facultyDashboard'],
    queryFn: facultyAPI.getDashboardStats
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: facultyAPI.getRecentActivity
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load dashboard" />;

  const statCards = [
    { icon: FiBook, label: 'Active Courses', value: stats?.activeCourses || 0, color: 'blue', link: '/faculty/courses' },
    { icon: FiUsers, label: 'Total Students', value: stats?.totalStudents || 0, color: 'indigo', link: '/faculty/students' },
    { icon: FiFileText, label: 'Assignments', value: stats?.totalAssignments || 0, color: 'purple', link: '/faculty/assignments' },
    { icon: FiCheckCircle, label: 'Pending Grading', value: stats?.pendingGrading || 0, color: 'orange', link: '/faculty/assignments' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="block animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4" style={{ borderLeftColor: `var(--color-${stat.color}-600)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 bg-${stat.color}-100 rounded-2xl`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <FiClock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/faculty/courses/create" className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
              <div className="flex items-center space-x-3">
                <FiBook className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Create Course</span>
              </div>
            </Link>
            <Link to="/faculty/assignments/create" className="block p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200">
              <div className="flex items-center space-x-3">
                <FiFileText className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-900">New Assignment</span>
              </div>
            </Link>
            <Link to="/faculty/announcements" className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
              <div className="flex items-center space-x-3">
                <FiTrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Post Announcement</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
