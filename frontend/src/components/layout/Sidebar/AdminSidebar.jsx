import React from 'react';
import Sidebar from './Sidebar';
import { FiHome, FiUsers, FiBook, FiSettings, FiBarChart2, FiShield, FiDatabase } from 'react-icons/fi';

const AdminSidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiUsers, label: 'User Management', path: '/admin/users' },
    { icon: FiBook, label: 'Course Management', path: '/admin/courses' },
    { icon: FiBarChart2, label: 'Reports', path: '/admin/reports' },
    { icon: FiDatabase, label: 'System Logs', path: '/admin/logs' },
    { icon: FiShield, label: 'Security', path: '/admin/security' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings' }
  ];

  return <Sidebar isOpen={isOpen} onClose={onClose} items={menuItems} />;
};

export default AdminSidebar;
