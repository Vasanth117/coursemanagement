import React from 'react';
import Sidebar from './Sidebar';
import { FiHome, FiBook, FiFileText, FiCalendar, FiAward, FiMessageSquare } from 'react-icons/fi';

const StudentSidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/student/dashboard' },
    { icon: FiBook, label: 'My Courses', path: '/student/courses' },
    { icon: FiFileText, label: 'Assignments', path: '/student/assignments', badge: '3' },
    { icon: FiCalendar, label: 'Schedule', path: '/student/schedule' },
    { icon: FiAward, label: 'Grades', path: '/student/grades' },
    { icon: FiMessageSquare, label: 'Announcements', path: '/student/announcements' }
  ];

  return <Sidebar isOpen={isOpen} onClose={onClose} items={menuItems} />;
};

export default StudentSidebar;
