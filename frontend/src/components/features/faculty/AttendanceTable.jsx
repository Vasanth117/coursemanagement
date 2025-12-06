import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AttendanceTable = ({ students = [], attendance = {}, onToggle }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={student._id} className="hover:bg-gray-50 animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.rollNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => onToggle(student._id, 'present')}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      attendance[student._id] === 'present'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FiCheckCircle className="inline h-4 w-4 mr-2" />
                    Present
                  </button>
                  <button
                    onClick={() => onToggle(student._id, 'absent')}
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${
                      attendance[student._id] === 'absent'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FiXCircle className="inline h-4 w-4 mr-2" />
                    Absent
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
