import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosConfig';
import { 
  FiDatabase, 
  FiActivity, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  LoadingSpinner, 
  Card, 
  Badge, 
  Table, 
  Pagination,
  Button
} from '../../components/common';

const Logs = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    module: 'all',
    status: 'all'
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminLogs', page, filter],
    queryFn: async () => {
      const { module, status } = filter;
      let url = `/admin/logs?page=${page}&limit=20`;
      if (module !== 'all') url += `&module=${module}`;
      if (status !== 'all') url += `&status=${status}`;
      const response = await api.get(url);
      return response.data;
    }
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (val) => (
        <div className="flex items-center text-gray-500">
          <FiClock className="mr-2" />
          {new Date(val).toLocaleString()}
        </div>
      )
    },
    {
      header: 'User',
      accessor: 'user',
      render: (user) => (
        <div>
          <p className="font-semibold text-gray-900">{user?.name || 'System'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (module) => (
        <Badge variant="info" className="uppercase font-bold tracking-wider">
          {module}
        </Badge>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (action) => (
        <span className="font-medium text-gray-700">{action.replace(/_/g, ' ')}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => (
        <div className="flex items-center">
          {status === 'success' ? (
            <FiCheckCircle className="text-green-500 mr-2" />
          ) : (
            <FiAlertCircle className="text-red-500 mr-2" />
          )}
          <span className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
            {status}
          </span>
        </div>
      )
    },
    {
        header: 'Details',
        accessor: 'details',
        render: (details) => (
          <span className="text-xs text-gray-400 max-w-xs truncate block" title={details}>
            {details || 'No extra info'}
          </span>
        )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FiDatabase className="text-blue-600" /> System Audit Logs
          </h1>
          <p className="text-gray-500 mt-1">Monitor and track all critical system activities</p>
        </div>
        <Button 
          variant="secondary" 
          icon={FiRefreshCw} 
          onClick={() => refetch()}
          className={isFetching ? 'animate-spin' : ''}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-50/50 backdrop-blur-md border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Filter by Module</label>
             <select 
               value={filter.module}
               onChange={(e) => setFilter({...filter, module: e.target.value})}
               className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             >
               <option value="all">All Modules</option>
               <option value="auth">Authentication</option>
               <option value="user">User Management</option>
               <option value="course">Courses</option>
               <option value="enrollment">Enrollments</option>
               <option value="system">System</option>
               <option value="security">Security</option>
             </select>
          </div>

          <div className="flex-1 min-w-[200px]">
             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-widest">Filter by Status</label>
             <select 
               value={filter.status}
               onChange={(e) => setFilter({...filter, status: e.target.value})}
               className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             >
               <option value="all">All Statuses</option>
               <option value="success">Success</option>
               <option value="failure">Failure</option>
             </select>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-indigo-200 shadow-xl p-6">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Total Activities</p>
                  <h3 className="text-4xl font-black">{pagination.total || 0}</h3>
               </div>
               <FiActivity className="text-white/20 text-4xl" />
            </div>
         </Card>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden border-none shadow-2xl">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Fetching system logs..." />
          </div>
        ) : (
          <>
            <Table 
              columns={columns} 
              data={logs} 
              className="bg-white"
            />
            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <Pagination 
                currentPage={page}
                totalPages={pagination.pages || 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Logs;
