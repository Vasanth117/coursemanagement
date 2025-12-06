import React from 'react';

const Grid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className = '' 
}) => {
  return (
    <div 
      className={`
        grid 
        grid-cols-${cols.sm} 
        md:grid-cols-${cols.md} 
        lg:grid-cols-${cols.lg} 
        xl:grid-cols-${cols.xl}
        gap-${gap}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Grid;
