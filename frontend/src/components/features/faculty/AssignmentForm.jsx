import React, { useState } from 'react';
import { InputField, SelectField, TextArea, FileUpload, PrimaryButton, SecondaryButton } from '../../common';

const AssignmentForm = ({ initialData, courses, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    course: '',
    type: '',
    dueDate: '',
    maxPoints: '',
    attachments: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    setFormData(prev => ({ ...prev, attachments: files }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField label="Assignment Title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Programming Assignment 1" />

      <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} required rows={5} placeholder="Assignment instructions..." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          label="Course"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
          options={[
            { value: '', label: 'Select Course' },
            ...(courses?.map(c => ({ value: c._id, label: `${c.courseCode} - ${c.title}` })) || [])
          ]}
        />
        <SelectField
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          options={[
            { value: '', label: 'Select Type' },
            { value: 'homework', label: 'Homework' },
            { value: 'quiz', label: 'Quiz' },
            { value: 'project', label: 'Project' },
            { value: 'exam', label: 'Exam' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Due Date" name="dueDate" type="datetime-local" value={formData.dueDate} onChange={handleChange} required />
        <InputField label="Max Points" name="maxPoints" type="number" value={formData.maxPoints} onChange={handleChange} required min="1" />
      </div>

      <FileUpload label="Attachments (Optional)" onChange={handleFileChange} multiple accept=".pdf,.doc,.docx,.zip" />

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Assignment' : 'Create Assignment'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default AssignmentForm;
