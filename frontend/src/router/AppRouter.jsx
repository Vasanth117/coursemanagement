import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { AdminRoutes } from './AdminRoutes';
import { FacultyRoutes } from './FacultyRoutes';
import { StudentRoutes } from './StudentRoutes';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {PublicRoutes()}

      {/* Admin Routes */}
      {AdminRoutes()}

      {/* Faculty Routes */}
      {FacultyRoutes()}

      {/* Student Routes */}
      {StudentRoutes()}

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
