import React from 'react';

const SecondaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  fullWidth = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        bg-white border-2 border-blue-600 text-blue-600
        hover:bg-blue-50 font-semibold rounded-lg
        transition-all duration-300 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
