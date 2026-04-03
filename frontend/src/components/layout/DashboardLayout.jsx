import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Header } from './Header';
import { StudentSidebar, FacultySidebar, AdminSidebar } from './Sidebar';
import { Footer } from './Footer';
import useWebSocket from '../../hooks/useWebSocket';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Initialize WebSocket for real-time updates
  useWebSocket();

  const getSidebar = () => {
    switch (user?.role) {
      case 'student':
        return <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
      case 'faculty':
        return <FacultySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
      case 'admin':
        return <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {getSidebar()}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
