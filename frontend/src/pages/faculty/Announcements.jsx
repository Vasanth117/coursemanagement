import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyAPI } from '../../api/faculty';
import { FiSend, FiTrash2, FiEdit, FiClock } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, Badge, Modal } from '../../components/common';
import { toast } from 'react-hot-toast';

const Announcements = () => {
  const [formData, setFormData] = useState({ title: '', content: '', course: '', priority: 'normal' });
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn: facultyAPI.getCourses
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['facultyAnnouncements'],
    queryFn: facultyAPI.getAnnouncements
  });

  const createMutation = useMutation({
    mutationFn: facultyAPI.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries(['facultyAnnouncements']);
      toast.success('Announcement posted successfully');
      setFormData({ title: '', content: '', course: '', priority: 'normal' });
    },
    onError: () => toast.error('Failed to post announcement')
  });

  const deleteMutation = useMutation({
    mutationFn: facultyAPI.deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries(['facultyAnnouncements']);
      toast.success('Announcement deleted');
    },
    onError: () => toast.error('Failed to delete announcement')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600 mt-1">Create and manage course announcements</p>
      </div>

      {/* Create Announcement Form */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
              <select
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course</option>
                {courses?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Class Cancelled - Tomorrow"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea
              required
              rows="6"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your announcement here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={FiSend} disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Announcements List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Announcements</h2>
        <div className="space-y-4">
          {announcements?.map((announcement, index) => (
            <Card key={announcement._id} className="hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                    <Badge variant={
                      announcement.priority === 'urgent' ? 'danger' :
                      announcement.priority === 'high' ? 'warning' :
                      announcement.priority === 'normal' ? 'primary' : 'default'
                    }>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{announcement.course?.title}</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FiEdit}
                    onClick={() => setEditingId(announcement._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={FiTrash2}
                    onClick={() => {
                      if (window.confirm('Delete this announcement?')) {
                        deleteMutation.mutate(announcement._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <FiClock className="h-4 w-4" />
                <span>Posted {new Date(announcement.createdAt).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
