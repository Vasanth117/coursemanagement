import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth';
import { DashboardLayout } from '../components/layout';
import {
  Dashboard,
  CoursesIndex,
  MyCourses,
  CourseDetails,
  EnrollCourse,
  AssignmentsIndex,
  AssignmentDetails,
  SubmitAssignment,
  GradesIndex,
  Schedule,
  Profile,
  Notifications
} from '../pages/student';

export const StudentRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
    <Route path="/student/dashboard" element={<Dashboard />} />
    <Route path="/student/courses" element={<CoursesIndex />} />
    <Route path="/student/courses/my-courses" element={<MyCourses />} />
    <Route path="/student/courses/:id" element={<CourseDetails />} />
    <Route path="/student/courses/:id/enroll" element={<EnrollCourse />} />
    <Route path="/student/assignments" element={<AssignmentsIndex />} />
    <Route path="/student/assignments/:id" element={<AssignmentDetails />} />
    <Route path="/student/assignments/:id/submit" element={<SubmitAssignment />} />
    <Route path="/student/grades" element={<GradesIndex />} />
    <Route path="/student/schedule" element={<Schedule />} />
    <Route path="/student/profile" element={<Profile />} />
    <Route path="/student/notifications" element={<Notifications />} />
  </Route>
);
