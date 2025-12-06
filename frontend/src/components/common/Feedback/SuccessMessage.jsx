import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const SuccessMessage = ({ 
  message = 'Success!',
  className = '' 
}) => {
  return (
    <div className={`bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fade-in ${className}`}>
      <div className="flex items-start">
        <FiCheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-sm font-semibold text-green-800">{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage;
