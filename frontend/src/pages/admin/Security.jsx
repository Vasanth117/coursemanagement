import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { 
  FiShield, 
  FiLock, 
  FiKey, 
  FiAlertTriangle, 
  FiSettings, 
  FiShieldOff, 
  FiUserCheck,
  FiActivity,
  FiRefreshCw,
  FiClock,
  FiDatabase,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  LoadingSpinner, 
  Card, 
  Badge, 
  Button, 
  Table,
  EmptyState
} from '../../components/common';

const Security = () => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminSecurity'],
    queryFn: async () => {
      const response = await api.get('/admin/security');
      return response.data;
    }
  });

  const securityData = data?.data || {};
  const stats = securityData?.stats || {};
  const recentEvents = securityData?.recentEvents || [];
  const metrics = securityData?.metrics || {};

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (val) => (
        <div className="flex items-center text-xs text-gray-500">
          <FiClock className="mr-2" />
          {new Date(val).toLocaleString()}
        </div>
      )
    },
    {
      header: 'User',
      accessor: 'user',
      render: (user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
             {user?.name?.[0] || 'S'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.name || 'System'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (action) => (
        <Badge variant="warning" className="uppercase font-bold tracking-tight text-[10px]">
          {action.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (ip) => <code className="text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-100">{ip || 'N/A'}</code>
    },
    {
       header: 'Status',
       accessor: 'status',
       render: (status) => (
         <div className="flex items-center justify-center">
           {status === 'success' ? (
             <FiCheckCircle className="text-green-500" />
           ) : (
             <FiAlertCircle className="text-red-500" />
           )}
         </div>
       )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <FiShield className="text-white text-3xl" />
             </div>
             <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">System Security</h1>
                <p className="text-gray-500 font-medium">Monitoring and managing campus cybersecurity infrastructure</p>
             </div>
          </div>
        </div>
        <Button 
          variant="primary" 
          icon={FiRefreshCw} 
          onClick={() => refetch()}
          className={`rounded-2xl shadow-xl shadow-blue-100 ${isFetching ? 'animate-spin' : ''}`}
        >
          Security Audit
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner fullScreen text="Auditing system status..." />
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              label="Failed Login Attempts" 
              value={stats.failedLogins || 0} 
              icon={FiLock} 
              color="red" 
              description="Last 30 days total"
            />
            <StatsCard 
              label="Unauthorized Access" 
              value={stats.unauthorizedAccess || 0} 
              icon={FiShieldOff} 
              color="orange" 
              description="Blocked violations"
            />
            <StatsCard 
              label="MFA Adoption Rate" 
              value={`${metrics.mfaPercentage || 0}%`} 
              icon={FiKey} 
              color="green" 
              description="2-factor authentication"
            />
             <StatsCard 
              label="Active Administrators" 
              value={stats.activeAdmins || 0} 
              icon={FiUserCheck} 
              color="blue" 
              description="Current active sessions"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Recent Security Incidents */}
             <div className="lg:col-span-8 space-y-6">
                 <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-500 rounded-lg text-white">
                              <FiActivity className="text-xl" />
                           </div>
                           <h3 className="text-2xl font-extrabold text-gray-900">Security Events</h3>
                        </div>
                        <Badge variant="info" className="px-4 py-1.5">Live Feed</Badge>
                    </div>
                    {recentEvents.length === 0 ? (
                       <div className="p-12">
                          <EmptyState 
                            title="No recent incidents" 
                            description="Maintain vigilance. Your system currently shows no security violations."
                          />
                       </div>
                    ) : (
                       <Table 
                         columns={columns} 
                         data={recentEvents} 
                         className="border-none"
                       />
                    )}
                    <div className="p-6 bg-red-50/30 border-t border-red-50 text-center">
                       <p className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center justify-center gap-2">
                          <FiAlertTriangle className="animate-pulse" /> Critical incidents require immediate review
                       </p>
                    </div>
                 </Card>
             </div>

             {/* Security Controls */}
             <div className="lg:col-span-4 space-y-8">
                 <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 border-none shadow-2xl text-white rounded-3xl p-8 sticky top-24">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <FiSettings className="text-blue-300" /> Security Policies
                    </h3>
                    <div className="space-y-6">
                        <PolicyToggle 
                          title="Mandatory MFA" 
                          description="Require 2-factor authentication for all faculty and admins"
                          active={true}
                        />
                        <PolicyToggle 
                          title="Auto Lockout" 
                          description="Lock account after 5 failed login attempts"
                          active={true}
                        />
                        <PolicyToggle 
                          title="IP Whitelisting" 
                          description="Restrict admin panel to campus network IPs"
                          active={false}
                        />
                        <PolicyToggle 
                          title="Session Expiry" 
                          description="Force logout of inactive sessions after 30 minutes"
                          active={true}
                        />
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-white/10">
                       <Button fullWidth variant="primary" className="bg-white text-blue-900 hover:bg-blue-50 border-none rounded-2xl p-4 font-bold">
                          Global Security Update
                       </Button>
                    </div>
                 </Card>

                 <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500">
                    <div className="p-8 space-y-4">
                       <div className="p-3 bg-blue-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                          <FiDatabase className="text-blue-600 text-2xl" />
                       </div>
                       <h4 className="text-xl font-black text-gray-900">Database Backup</h4>
                       <p className="text-gray-500 text-sm font-medium">Last full backup completed 4 hours ago. All system data is encrypted at rest.</p>
                       <Button variant="secondary" fullWidth className="rounded-xl mt-4">Manual Backup</Button>
                    </div>
                 </Card>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, color, description }) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <Card className={`border-none ${colors[color]} border-l-8 shadow-xl hover:scale-105 transition-all duration-300 p-8 flex flex-col justify-between`}>
       <div className="flex justify-between items-start">
          <div>
             <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">{label}</p>
             <h3 className="text-4xl font-black">{value}</h3>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl">
            <Icon className="text-2xl" />
          </div>
       </div>
       <p className="text-[10px] font-bold mt-4 opacity-60 uppercase tracking-tighter">{description}</p>
    </Card>
  );
};

const PolicyToggle = ({ title, description, active }) => (
  <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors group">
     <div className="flex-1">
        <h5 className="font-bold text-sm mb-1">{title}</h5>
        <p className="text-[10px] text-blue-200 leading-tight">{description}</p>
     </div>
     <div className={`w-10 h-6 rounded-full p-1 transition-all flex ${active ? 'bg-green-400 justify-end' : 'bg-white/20 justify-start'}`}>
        <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
     </div>
  </div>
);

export default Security;
