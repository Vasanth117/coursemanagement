import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { FiBook, FiFileText, FiDownload, FiCalendar, FiClock, FiMapPin, FiUser, FiPlay, FiEye } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, Tabs } from '../../../components/common';

const CourseDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: ['coursePreview', id],
    queryFn: () => studentAPI.getCoursePreview(id)
  });

  const { data: assignments } = useQuery({
    queryKey: ['courseAssignments', id],
    queryFn: () => studentAPI.getCourseAssignments(id),
    enabled: !!id
  });

  const { data: resources } = useQuery({
    queryKey: ['courseResources', id],
    queryFn: () => studentAPI.getCourseResources(id),
    enabled: !!id
  });

  const course = data?.data || data;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignments', label: `Assignments (${assignments?.length || 0})` },
    { id: 'resources', label: `Resources (${resources?.length || 0})` }
  ];

  if (isLoading) return <LoadingSpinner />;
  
  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Course not found or you don't have access to view this course.</p>
            <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{course?.title || 'Course Title'}</h1>
            <Badge variant="primary">{course?.courseCode || course?.code || 'N/A'}</Badge>
          </div>
          <p className="text-gray-600">{course?.department || 'N/A'} • {course?.credits || 'N/A'} Credits</p>
        </div>
        <div className="flex gap-3">
          {course?.isEnrolled && (
            <Link to={`/student/courses/${id}/learning`}>
              <Button variant="primary" icon={FiPlay}>Resume Learning</Button>
            </Link>
          )}
          {!course?.isEnrolled && (
            <Link to={`/student/courses/${id}/enroll`}>
              <Button variant="primary">Enroll Now</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiBook className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Credits</p>
              <p className="text-2xl font-bold text-gray-900">{course?.credits || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiFileText className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-purple-600">
          <div className="flex items-center space-x-3">
            <FiDownload className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Resources</p>
              <p className="text-2xl font-bold text-gray-900">{resources?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiUser className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="text-lg font-bold text-gray-900">{course?.faculty?.name || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
            <p className="text-gray-700 leading-relaxed">{course?.description || 'No description available.'}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FiCalendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Days</p>
                  <p className="text-sm text-gray-600">{course?.schedule?.days?.join(', ') || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiClock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-600">{course?.schedule?.time || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Room</p>
                  <p className="text-sm text-gray-600">{course?.schedule?.room || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiUser className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Instructor</p>
                  <p className="text-sm text-gray-600">{course?.faculty?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{course?.faculty?.email || ''}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments?.map((assignment, index) => (
            <Card key={assignment._id} className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                <Badge variant={assignment.submitted ? 'success' : new Date(assignment.dueDate) > new Date() ? 'warning' : 'danger'}>
                  {assignment.submitted ? 'Submitted' : new Date(assignment.dueDate) > new Date() ? 'Pending' : 'Overdue'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                <span className="font-medium text-gray-900">{assignment.totalMarks} marks</span>
              </div>
              <Link to={`/student/assignments/${assignment._id}`}>
                <Button variant="primary" className="w-full">View Assignment</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources?.map((resource, index) => (
            <Card key={resource._id} className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start space-x-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiDownload className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="primary">{resource.type}</Badge>
                    <span className="text-xs text-gray-500">{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {resource.files?.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <FiDownload className="h-4 w-4 text-blue-600" />
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;