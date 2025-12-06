import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { facultyAPI } from '../../../api/faculty';
import { FiSave, FiX } from 'react-icons/fi';
import { LoadingSpinner, Card, Button, ErrorMessage } from '../../../components/common';
import { toast } from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => facultyAPI.getCourseById(id)
  });

  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        courseCode: course.courseCode,
        description: course.description,
        department: course.department,
        credits: course.credits,
        semester: course.semester,
        schedule: course.schedule || { days: [], time: '', room: '' }
      });
    }
  }, [course]);

  const updateMutation = useMutation({
    mutationFn: (data) => facultyAPI.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course', id]);
      queryClient.invalidateQueries(['facultyCourses']);
      toast.success('Course updated successfully');
      navigate(`/faculty/courses/${id}`);
    },
    onError: () => toast.error('Failed to update course')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDayToggle = (day) => {
    const days = formData.schedule?.days || [];
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days: days.includes(day) ? days.filter(d => d !== day) : [...days, day]
      }
    });
  };

  if (isLoading) return <LoadingSpinner />;

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-1">Update course information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
              <input
                type="text"
                required
                value={formData.courseCode || ''}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select
                required
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="EEE">Electrical</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credits *</label>
              <input
                type="number"
                required
                min="1"
                max="6"
                value={formData.credits || ''}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows="4"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Class Days *</label>
              <div className="flex flex-wrap gap-3">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      formData.schedule?.days?.includes(day)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 10:00 AM - 11:00 AM"
                  value={formData.schedule?.time || ''}
                  onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, time: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Room 301"
                  value={formData.schedule?.room || ''}
                  onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, room: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" icon={FiX} onClick={() => navigate(`/faculty/courses/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={FiSave} disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
