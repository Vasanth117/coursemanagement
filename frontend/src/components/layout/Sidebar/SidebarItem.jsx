import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '../../common';

const SidebarItem = ({ icon: Icon, label, path, badge, subItems = [] }) => {
  if (subItems.length > 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-3 px-4 py-2 text-blue-200 text-sm font-semibold">
          {Icon && <Icon className="w-5 h-5" />}
          <span>{label}</span>
        </div>
        {subItems.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-white text-blue-600 shadow-lg'
            : 'text-white hover:bg-blue-500'
        }`
      }
    >
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 h-5" />}
        <span className="font-medium">{label}</span>
      </div>
      {badge && <Badge variant="danger" size="sm">{badge}</Badge>}
    </NavLink>
  );
};

export default SidebarItem;
