import React from 'react';

const Checkbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center mb-4 ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-5 h-5 text-blue-600 border-2 border-gray-300 rounded
          focus:ring-2 focus:ring-blue-500
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
        "
      />
      {label && (
        <label className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
