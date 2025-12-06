import React, { useRef } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const FileUpload = ({
  label,
  name,
  onChange,
  error,
  required = false,
  accept,
  multiple = false,
  files = [],
  onRemove,
  className = ''
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6
          ${error ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'}
          transition-all duration-300 cursor-pointer
          bg-gray-50 hover:bg-blue-50
        `}
      >
        <div className="flex flex-col items-center justify-center">
          <FiUpload className="w-10 h-10 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {accept || 'All file types accepted'}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <FiFile className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
