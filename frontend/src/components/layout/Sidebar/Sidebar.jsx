import React from 'react';
import { FiX } from 'react-icons/fi';
import SidebarItem from './SidebarItem';

const Sidebar = ({ isOpen, onClose, items, logo = true }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-blue-600 to-indigo-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500">
          {logo && (
            <div className="flex items-center space-x-3">
              <img src="/images/sece-logo.png" alt="SECE" className="w-10 h-10 rounded-lg bg-white p-1" />
              <div>
                <h2 className="text-white font-bold text-lg">SECE</h2>
                <p className="text-blue-200 text-xs">Course Management</p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="space-y-1">
            {items.map((item, index) => (
              <SidebarItem key={index} {...item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-blue-500">
          <p className="text-xs text-blue-200 text-center">© 2024 SECE. All rights reserved.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
