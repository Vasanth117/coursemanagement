import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { Card, InputField, SelectField, TextArea, PrimaryButton, SecondaryButton, Checkbox } from '../../../components/common';
import { facultyAPI } from '../../../api/faculty';

const CreateCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    credits: 3,
    department: '',
    semester: '',
    year: new Date().getFullYear(),
    maxStudents: 60,
    schedule: { days: [], time: '', room: '' }
  });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (courseData) => facultyAPI.createCourse(courseData),
    onSuccess: () => {
      toast.success('Course created successfully');
      // Invalidate multiple caches for real-time updates
      queryClient.invalidateQueries(['facultyCourses']);
      queryClient.invalidateQueries(['availableCourses']);
      queryClient.invalidateQueries(['allCourses']);
      navigate('/faculty/courses');
    },
    onError: (error) => {
      console.error('Course creation error:', error);
      const errorMessage = error?.error || error?.message || 'Failed to create course';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/faculty/courses')} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">Design a new course for the semester</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Course Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} required />
            <InputField label="Course Code" name="code" value={formData.code} onChange={handleChange} error={errors.code} required />
            <SelectField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: 'cse', label: 'Computer Science' },
                { value: 'ece', label: 'Electronics' },
                { value: 'eee', label: 'Electrical' },
                { value: 'me', label: 'Mechanical' },
                { value: 'ce', label: 'Civil' }
              ]}
              required
            />
            <SelectField
              label="Credits"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              options={[1, 2, 3, 4, 5].map(n => ({ value: n, label: `${n} Credit${n > 1 ? 's' : ''}` }))}
            />
            <SelectField
              label="Semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              options={[
                { value: 'Fall', label: 'Fall' },
                { value: 'Spring', label: 'Spring' },
                { value: 'Summer', label: 'Summer' }
              ]}
              required
            />
            <InputField label="Year" name="year" type="number" value={formData.year} onChange={handleChange} error={errors.year} required />
          </div>
          <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
        </Card>

        <Card title="Schedule">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Days of Week</label>
              <div className="grid grid-cols-3 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      formData.schedule.days.includes(day)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <InputField label="Class Time" name="time" type="time" value={formData.schedule.time} onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, time: e.target.value } }))} required />
            <InputField label="Room" name="room" value={formData.schedule.room} onChange={(e) => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, room: e.target.value } }))} required />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <SecondaryButton type="button" onClick={() => navigate('/faculty/courses')}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" loading={createMutation.isLoading}>
            <FiSave className="w-5 h-5 mr-2" />
            Create Course
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
