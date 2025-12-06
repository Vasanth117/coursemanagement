import React from 'react';
import { FiServer, FiDatabase, FiActivity, FiCpu } from 'react-icons/fi';

const SystemStats = ({ stats }) => {
  const metrics = [
    { icon: FiServer, label: 'Server Uptime', value: stats?.uptime || '99.9%', status: 'excellent', color: 'green' },
    { icon: FiDatabase, label: 'Database Load', value: stats?.dbLoad || '23%', status: 'good', color: 'blue' },
    { icon: FiActivity, label: 'API Response', value: stats?.apiResponse || '45ms', status: 'excellent', color: 'purple' },
    { icon: FiCpu, label: 'CPU Usage', value: stats?.cpuUsage || '34%', status: 'good', color: 'orange' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-${metric.color}-100 rounded-xl`}>
              <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${
              metric.status === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {metric.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SystemStats;
