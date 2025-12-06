import React from 'react';
import { FiSearch } from 'react-icons/fi';

const CourseSearch = ({ value, onChange, placeholder = 'Search courses...' }) => {
  return (
    <div className="relative">
      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );
};

export default CourseSearch;
