import React from 'react';
import { Link } from 'react-router-dom';

const StatsCard = ({ icon: Icon, label, value, color = 'blue', link, trend, className = '' }) => {
  const colorClasses = {
    blue: 'border-blue-600 bg-blue-50',
    green: 'border-green-600 bg-green-50',
    purple: 'border-purple-600 bg-purple-50',
    orange: 'border-orange-600 bg-orange-50',
    red: 'border-red-600 bg-red-50',
    indigo: 'border-indigo-600 bg-indigo-50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  const CardContent = () => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${colorClasses[color]} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${colorClasses[color]}`}>
          <Icon className={`h-8 w-8 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
};

export default StatsCard;
