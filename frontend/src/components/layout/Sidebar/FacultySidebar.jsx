import React from 'react';
import Sidebar from './Sidebar';
import { FiHome, FiBook, FiFileText, FiUsers, FiBarChart2, FiMessageSquare, FiFolder } from 'react-icons/fi';

const FacultySidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/faculty/dashboard' },
    { icon: FiBook, label: 'My Courses', path: '/faculty/courses' },
    { icon: FiFileText, label: 'Assignments', path: '/faculty/assignments' },
    { icon: FiUsers, label: 'Students', path: '/faculty/students' },
    { icon: FiBarChart2, label: 'Gradebook', path: '/faculty/gradebook' },
    { icon: FiMessageSquare, label: 'Announcements', path: '/faculty/announcements' },
    { icon: FiFolder, label: 'Resources', path: '/faculty/resources' }
  ];

  return <Sidebar isOpen={isOpen} onClose={onClose} items={menuItems} />;
};

export default FacultySidebar;
