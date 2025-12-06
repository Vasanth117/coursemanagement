import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const AnalyticsChart = ({ data, title, type = 'bar' }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2 text-green-600">
          <FiTrendingUp className="h-5 w-5" />
          <span className="text-sm font-semibold">+12%</span>
        </div>
      </div>

      {type === 'bar' && (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'line' && (
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t-lg transition-all duration-1000 hover:opacity-80"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
