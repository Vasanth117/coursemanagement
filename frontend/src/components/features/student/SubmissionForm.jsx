import React, { useState } from 'react';
import { TextArea, FileUpload, PrimaryButton, SecondaryButton } from '../../common';
import { FiUpload, FiFile } from 'react-icons/fi';

const SubmissionForm = ({ assignment, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    content: '',
    files: []
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  const handleFileChange = (files) => {
    setFormData(prev => ({ ...prev, files }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment?.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{assignment?.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Due Date: </span>
            <span className="font-semibold text-gray-900">{new Date(assignment?.dueDate).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Max Points: </span>
            <span className="font-semibold text-blue-600">{assignment?.maxPoints}</span>
          </div>
        </div>
      </div>

      <TextArea label="Submission Text" name="content" value={formData.content} onChange={handleChange} rows={8} placeholder="Enter your submission text here..." />

      <FileUpload label="Upload Files" onChange={handleFileChange} multiple accept=".pdf,.doc,.docx,.zip,.jpg,.png" icon={FiUpload} />

      {formData.files.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
          <div className="space-y-2">
            {Array.from(formData.files).map((file, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <FiFile className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Assignment'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default SubmissionForm;
