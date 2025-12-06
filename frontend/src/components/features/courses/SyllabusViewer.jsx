import React from 'react';
import { FiDownload, FiBook, FiCalendar, FiUser } from 'react-icons/fi';
import { PrimaryButton } from '../../common';

const SyllabusViewer = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
        <PrimaryButton icon={FiDownload}>Download PDF</PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiBook className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Course Code</p>
            <p className="font-semibold text-gray-900">{course?.courseCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiUser className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Instructor</p>
            <p className="font-semibold text-gray-900">{course?.faculty?.name}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Course Description</h3>
        <p className="text-gray-600">{course?.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Learning Objectives</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Understand core concepts and principles</li>
          <li>Apply theoretical knowledge to practical problems</li>
          <li>Develop critical thinking and analytical skills</li>
        </ul>
      </div>
    </div>
  );
};

export default SyllabusViewer;
