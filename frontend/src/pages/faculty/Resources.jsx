import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../../api/faculty';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiFolder } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, Badge, EmptyState } from '../../components/common';
import { toast } from 'react-hot-toast';

const Resources = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [uploadData, setUploadData] = useState({ title: '', description: '', type: 'lecture', files: [] });
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ['courseResources', selectedCourse],
    queryFn: () => facultyAPI.getResources(selectedCourse),
    enabled: !!selectedCourse
  });

  const uploadMutation = useMutation({
    mutationFn: (data) => facultyAPI.uploadResource(selectedCourse, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courseResources', selectedCourse]);
      toast.success('Resource uploaded successfully');
      setUploadData({ title: '', description: '', type: 'lecture', files: [] });
    },
    onError: () => toast.error('Failed to upload resource')
  });

  const deleteMutation = useMutation({
    mutationFn: facultyAPI.deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries(['courseResources', selectedCourse]);
      toast.success('Resource deleted');
    },
    onError: () => toast.error('Failed to delete resource')
  });

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, files: Array.from(e.target.files) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('type', uploadData.type);
    uploadData.files.forEach(file => formData.append('files', file));
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Resources</h1>
        <p className="text-gray-600 mt-1">Upload and manage course materials</p>
      </div>

      {/* Course Selection */}
      <Card>
        <div className="flex items-center space-x-4">
          <FiFolder className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a course</option>
            {courses?.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCourse && (
        <>
          {/* Upload Form */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g., Lecture 5 - Data Structures"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type *</label>
                  <select
                    required
                    value={uploadData.type}
                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lecture">Lecture Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="reference">Reference Material</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Brief description of the resource..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Files *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                  <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium text-lg">Choose files to upload</span>
                    <input
                      type="file"
                      multiple
                      required
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.avi"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PDF, DOC, PPT, Video, ZIP up to 50MB each</p>
                  {uploadData.files.length > 0 && (
                    <div className="mt-4 text-left bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Selected files ({uploadData.files.length}):</p>
                      {Array.from(uploadData.files).map((file, index) => (
                        <p key={index} className="text-sm text-gray-700">• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" icon={FiUpload} disabled={uploadMutation.isLoading}>
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Resource'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Resources List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Resources</h2>
            {isLoading ? (
              <LoadingSpinner />
            ) : resources?.length === 0 ? (
              <EmptyState
                icon={FiFile}
                title="No resources uploaded"
                description="Upload your first resource to get started"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources?.map((resource, index) => (
                  <Card key={resource._id} className="hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FiFile className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="primary">{resource.type}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(resource.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {resource.files?.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FiDownload className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">{resource.downloads || 0} downloads</span>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={FiTrash2}
                        onClick={() => {
                          if (window.confirm('Delete this resource?')) {
                            deleteMutation.mutate(resource._id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Resources;
