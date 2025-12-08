import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../api/student';
import { FiBook, FiFileText, FiTrendingUp, FiCalendar, FiClock, FiBell } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, ProgressBar } from '../../components/common';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: studentAPI.getDashboardStats
  });

  const { data: upcomingAssignments } = useQuery({
    queryKey: ['upcomingAssignments'],
    queryFn: studentAPI.getUpcomingAssignments,
    enabled: !!stats
  });

  const { data: announcements } = useQuery({
    queryKey: ['recentAnnouncements'],
    queryFn: studentAPI.getAnnouncements,
    enabled: !!stats
  });

  if (isLoading) return <LoadingSpinner />;

  const statCards = [
    { icon: FiBook, label: 'Enrolled Courses', value: stats?.enrolledCourses || 0, color: 'blue', link: '/student/courses/my-courses' },
    { icon: FiFileText, label: 'Pending Assignments', value: stats?.pendingAssignments || 0, color: 'orange', link: '/student/assignments' },
    { icon: FiTrendingUp, label: 'Average Grade', value: stats?.averageGrade || 'N/A', color: 'green', link: '/student/grades' },
    { icon: FiCalendar, label: 'Attendance', value: `${stats?.attendanceRate || 0}%`, color: 'purple', link: '/student/schedule' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your academic overview</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Assignments</h2>
            <Link to="/student/assignments" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAssignments?.slice(0, 5).map((assignment, index) => (
              <Link key={assignment._id} to={`/student/assignments/${assignment._id}`} className="block">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.course?.title}</p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                      <FiClock className="h-4 w-4" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={new Date(assignment.dueDate) > new Date() ? 'warning' : 'danger'}>
                    {new Date(assignment.dueDate) > new Date() ? 'Pending' : 'Overdue'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
            <FiBell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {announcements?.slice(0, 4).map((announcement, index) => (
              <div key={announcement._id} className="p-4 bg-blue-50 rounded-xl border border-blue-100 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{announcement.title}</h3>
                  <Badge variant={announcement.priority === 'urgent' ? 'danger' : 'primary'} size="sm">
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">{new Date(announcement.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Academic Progress */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Academic Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Course Completion</span>
              <span className="text-sm font-bold text-gray-900">{stats?.courseCompletion || 0}%</span>
            </div>
            <ProgressBar value={stats?.courseCompletion || 0} color="blue" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Assignment Submission</span>
              <span className="text-sm font-bold text-gray-900">{stats?.assignmentSubmission || 0}%</span>
            </div>
            <ProgressBar value={stats?.assignmentSubmission || 0} color="green" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
              <span className="text-sm font-bold text-gray-900">{stats?.attendanceRate || 0}%</span>
            </div>
            <ProgressBar value={stats?.attendanceRate || 0} color="purple" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
