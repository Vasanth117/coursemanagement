import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ 
  message = 'An error occurred',
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in ${className}`}>
      <div className="flex items-start">
        <FiAlertCircle className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
