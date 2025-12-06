import React from 'react';

const Card = ({ 
  children, 
  title,
  subtitle,
  headerAction,
  className = '',
  padding = 'p-6',
  hover = false
}) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-105' : ''}
        ${className}
      `}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;
