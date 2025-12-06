import React from 'react';
import { FiClock } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/formatters';

const RecentActivity = ({ activities = [], maxItems = 5 }) => {
  const getActivityIcon = (type) => {
    const icons = {
      course: '📚',
      assignment: '📝',
      grade: '✅',
      announcement: '📢',
      enrollment: '🎓'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <FiClock className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {activities.slice(0, maxItems).map((activity, index) => (
          <div
            key={activity._id || index}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
              <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
