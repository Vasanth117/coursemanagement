import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../api/student';
import { FiBell, FiCheckCircle, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button, EmptyState } from '../../components/common';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['studentNotifications'],
    queryFn: studentAPI.getNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: studentAPI.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentNotifications']);
      toast.success('Notification marked as read');
    }
  });

  const deleteNotification = useMutation({
    mutationFn: studentAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentNotifications']);
      toast.success('Notification deleted');
    }
  });

  const filteredNotifications = notifications?.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your academic activities</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-600">
          <div className="flex items-center space-x-3">
            <FiBell className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-orange-600">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.filter(n => !n.read).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-green-600">
          <div className="flex items-center space-x-3">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications?.filter(n => n.read).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </Card>

      {/* Notifications List */}
      {filteredNotifications?.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-4">
          {filteredNotifications?.map((notification, index) => (
            <Card key={notification._id} className={`hover:shadow-lg transition-all animate-slide-up ${!notification.read ? 'border-l-4 border-blue-600' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${notification.type === 'urgent' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <FiBell className={`h-5 w-5 ${notification.type === 'urgent' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Badge variant="primary">New</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={FiCheckCircle}
                      onClick={() => markReadMutation.mutate(notification._id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={FiTrash2}
                    onClick={() => deleteNotification.mutate(notification._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
