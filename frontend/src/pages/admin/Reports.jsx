import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import { Card, SelectField, PrimaryButton, Badge, LoadingSpinner } from '../../components/common';
import { adminAPI } from '../../api/admin';

const Reports = () => {
  const [reportType, setReportType] = useState('users');
  const [dateRange, setDateRange] = useState('month');

  // Fetch recent reports (if backend supports)
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminAPI.getReports?.() || Promise.resolve({ data: [] }),
  });

  const reports = reportsData?.data || [];

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: ({ type, range }) => adminAPI.generateReport(type, { dateRange: range }),
    onSuccess: () => {
      toast.success('Report generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ type: reportType, range: dateRange });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and download system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Generate New Report" className="lg:col-span-1">
          <div className="space-y-4">
            <SelectField
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { value: 'users', label: 'User Activity' },
                { value: 'courses', label: 'Course Enrollment' },
                { value: 'assignments', label: 'Assignment Submissions' },
                { value: 'grades', label: 'Grade Distribution' },
                { value: 'system', label: 'System Performance' }
              ]}
            />
            <SelectField
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'quarter', label: 'Last Quarter' },
                { value: 'year', label: 'Last Year' }
              ]}
            />
            <PrimaryButton fullWidth loading={generateMutation.isLoading} onClick={handleGenerate}>
              <FiFileText className="w-5 h-5 mr-2" />
              Generate Report
            </PrimaryButton>
          </div>
        </Card>

        <Card title="Recent Reports" className="lg:col-span-2">
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {report.status === 'completed' && (
                  <button className="text-blue-600 hover:text-blue-800">
                    <FiDownload className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Report Templates">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['User Activity', 'Course Performance', 'System Health'].map((template) => (
            <div key={template} className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <FiFileText className="w-8 h-8 text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-900">{template}</h3>
              <p className="text-sm text-gray-600 mt-2">Click to use this template</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
