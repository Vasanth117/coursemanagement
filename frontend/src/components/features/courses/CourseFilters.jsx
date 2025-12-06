import React from 'react';
import { FiFilter } from 'react-icons/fi';

const CourseFilters = ({ filters, onChange }) => {
  const departments = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FiFilter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={filters.department || 'All'}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
          <select
            value={filters.semester || 'All'}
            onChange={(e) => onChange({ ...filters, semester: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem === 'All' ? 'All Semesters' : `Semester ${sem}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
          <select
            value={filters.credits || 'All'}
            onChange={(e) => onChange({ ...filters, credits: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Credits</option>
            <option value="1">1 Credit</option>
            <option value="2">2 Credits</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>
        </div>

        <button
          onClick={() => onChange({ department: 'All', semester: 'All', credits: 'All' })}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default CourseFilters;
