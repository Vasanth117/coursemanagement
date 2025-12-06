import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiSearch, FiFileText, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, EmptyState, Button } from '../../../components/common';

const AssignmentsIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['studentAssignments'],
    queryFn: studentAPI.getAssignments
  });

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'pending' && !assignment.submitted) ||
      (statusFilter === 'submitted' && assignment.submitted) ||
      (statusFilter === 'graded' && assignment.grade !== undefined);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = {
    total: assignments?.length || 0,
    pending: assignments?.filter(a => !a.submitted).length || 0,
    submitted: assignments?.filter(a => a.submitted && a.grade === undefined).length || 0,
    graded: assignments?.filter(a => a.grade !== undefined).length || 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-1">Track and submit your assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiClock className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
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
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </Card>

      {/* Assignments List */}
      {filteredAssignments?.length === 0 ? (
        <EmptyState icon={FiFileText} title="No assignments found" description="No assignments match your search criteria" />
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
                    <Badge variant={
                      assignment.grade !== undefined ? 'success' :
                      assignment.submitted ? 'primary' :
                      new Date(assignment.dueDate) > new Date() ? 'warning' : 'danger'
                    }>
                      {assignment.grade !== undefined ? 'Graded' :
                       assignment.submitted ? 'Submitted' :
                       new Date(assignment.dueDate) > new Date() ? 'Pending' : 'Overdue'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FiClock className="h-4 w-4" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiFileText className="h-4 w-4" />
                      <span>{assignment.totalMarks} marks</span>
                    </div>
                    {assignment.grade !== undefined && (
                      <div className="flex items-center space-x-2">
                        <FiCheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">Grade: {assignment.grade}/{assignment.totalMarks}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link to={`/student/assignments/${assignment._id}`}>
                  <Button variant="primary">View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsIndex;
