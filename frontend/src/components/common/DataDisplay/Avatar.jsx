import React from 'react';

const Avatar = ({ 
  src, 
  alt = 'Avatar',
  name,
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={`
        ${sizes[size]}
        rounded-full overflow-hidden
        bg-gradient-to-br from-blue-600 to-indigo-600
        flex items-center justify-center
        text-white font-bold
        shadow-lg
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
};

export default Avatar;
