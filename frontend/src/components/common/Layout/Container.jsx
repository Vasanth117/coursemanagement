import React from 'react';

const Container = ({ 
  children, 
  maxWidth = 'max-w-7xl',
  className = '' 
}) => {
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
