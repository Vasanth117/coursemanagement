import React, { useState } from 'react';
import { InputField, SelectField, TextArea, PrimaryButton, SecondaryButton } from '../../common';

const CourseForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    courseCode: '',
    description: '',
    department: '',
    credits: '',
    semester: '',
    maxStudents: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Course Title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Data Structures" />
        <InputField label="Course Code" name="courseCode" value={formData.courseCode} onChange={handleChange} required placeholder="e.g., CS201" />
      </div>

      <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Course description..." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelectField
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          options={[
            { value: '', label: 'Select Department' },
            { value: 'CSE', label: 'Computer Science' },
            { value: 'ECE', label: 'Electronics' },
            { value: 'EEE', label: 'Electrical' },
            { value: 'MECH', label: 'Mechanical' },
            { value: 'CIVIL', label: 'Civil' }
          ]}
        />
        <InputField label="Credits" name="credits" type="number" value={formData.credits} onChange={handleChange} required min="1" max="6" />
        <SelectField
          label="Semester"
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          required
          options={[
            { value: '', label: 'Select Semester' },
            ...Array.from({ length: 8 }, (_, i) => ({ value: i + 1, label: `Semester ${i + 1}` }))
          ]}
        />
      </div>

      <InputField label="Max Students" name="maxStudents" type="number" value={formData.maxStudents} onChange={handleChange} required min="10" max="100" />

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Course' : 'Create Course'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default CourseForm;
