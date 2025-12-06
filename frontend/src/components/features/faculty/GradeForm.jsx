import React, { useState } from 'react';
import { InputField, TextArea, PrimaryButton, SecondaryButton } from '../../common';

const GradeForm = ({ submission, maxPoints, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    score: submission?.grade?.score || '',
    feedback: submission?.grade?.feedback || '',
    letterGrade: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'score' && maxPoints) {
        const percentage = (parseFloat(value) / maxPoints) * 100;
        updated.letterGrade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const percentage = formData.score && maxPoints ? ((formData.score / maxPoints) * 100).toFixed(1) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Student</p>
            <p className="font-semibold text-gray-900">{submission?.student?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="font-semibold text-gray-900">{new Date(submission?.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField label={`Score (out of ${maxPoints})`} name="score" type="number" value={formData.score} onChange={handleChange} required min="0" max={maxPoints} step="0.5" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Percentage</label>
          <div className="px-4 py-2 bg-gray-100 rounded-xl text-center">
            <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Letter Grade</label>
          <div className="px-4 py-2 bg-gray-100 rounded-xl text-center">
            <span className="text-2xl font-bold text-gray-900">{formData.letterGrade || '-'}</span>
          </div>
        </div>
      </div>

      <TextArea label="Feedback" name="feedback" value={formData.feedback} onChange={handleChange} rows={5} placeholder="Provide feedback to the student..." />

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Grade'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default GradeForm;
