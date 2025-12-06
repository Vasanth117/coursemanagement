import React from 'react';

const SkeletonLoader = ({ 
  type = 'text', 
  count = 1,
  className = '' 
}) => {
  const skeletons = {
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-8 bg-gray-200 rounded',
    card: 'h-48 bg-gray-200 rounded-2xl',
    avatar: 'w-12 h-12 bg-gray-200 rounded-full',
    button: 'h-10 w-32 bg-gray-200 rounded-lg'
  };

  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletons[type]} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
