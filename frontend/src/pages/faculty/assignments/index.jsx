import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiPlus, FiSearch, FiFileText, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, EmptyState, Button } from '../../../components/common';

const AssignmentsIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['facultyAssignments'],
    queryFn: facultyAPI.getAssignments
  });

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && new Date(assignment.dueDate) > new Date()) ||
      (statusFilter === 'overdue' && new Date(assignment.dueDate) <= new Date());
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Manage course assignments and submissions</p>
        </div>
        <Link to="/faculty/assignments/create">
          <Button variant="primary" icon={FiPlus}>Create Assignment</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{assignments?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.filter(a => new Date(a.dueDate) > new Date()).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiClock className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.reduce((sum, a) => sum + (a.pendingSubmissions || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-red-600">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.filter(a => new Date(a.dueDate) <= new Date()).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Assignments</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Card>

      {/* Assignments List */}
      {filteredAssignments?.length === 0 ? (
        <EmptyState
          icon={FiFileText}
          title="No assignments found"
          description="Create your first assignment to get started"
          action={<Link to="/faculty/assignments/create"><Button variant="primary" icon={FiPlus}>Create Assignment</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments?.map((assignment, index) => (
            <Card key={assignment._id} className="hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.course?.title}</p>
                    </div>
                    <Badge variant={new Date(assignment.dueDate) > new Date() ? 'success' : 'danger'}>
                      {new Date(assignment.dueDate) > new Date() ? 'Active' : 'Overdue'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FiClock className="h-4 w-4" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiFileText className="h-4 w-4" />
                      <span>{assignment.totalSubmissions || 0} submissions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="h-4 w-4" />
                      <span>{assignment.gradedSubmissions || 0} graded</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/faculty/assignments/${assignment._id}`}>
                    <Button variant="secondary">View Details</Button>
                  </Link>
                  <Link to={`/faculty/assignments/${assignment._id}/submissions`}>
                    <Button variant="primary">Grade</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsIndex;
