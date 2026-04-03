import React, { createContext, useState, useEffect } from 'react';
import { studentAPI } from '../api/student';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await studentAPI.getNotifications();
      const notificationsData = response.data || [];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await studentAPI.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
