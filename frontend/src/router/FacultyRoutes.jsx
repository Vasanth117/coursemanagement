import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth';
import { DashboardLayout } from '../components/layout';
import {
  Dashboard,
  CoursesIndex,
  CreateCourse,
  CourseDetails,
  EditCourse,
  AssignmentsIndex,
  CreateAssignment,
  AssignmentDetails,
  Submissions,
  GradeAssignment,
  StudentsIndex,
  StudentDetails,
  Attendance,
  Gradebook,
  Announcements,
  Resources
} from '../pages/faculty';

export const FacultyRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
    <Route path="/faculty/dashboard" element={<Dashboard />} />
    <Route path="/faculty/courses" element={<CoursesIndex />} />
    <Route path="/faculty/courses/create" element={<CreateCourse />} />
    <Route path="/faculty/courses/:id" element={<CourseDetails />} />
    <Route path="/faculty/courses/:id/edit" element={<EditCourse />} />
    <Route path="/faculty/assignments" element={<AssignmentsIndex />} />
    <Route path="/faculty/assignments/create" element={<CreateAssignment />} />
    <Route path="/faculty/assignments/:id" element={<AssignmentDetails />} />
    <Route path="/faculty/assignments/:id/submissions" element={<Submissions />} />
    <Route path="/faculty/assignments/:id/grade/:submissionId" element={<GradeAssignment />} />
    <Route path="/faculty/students" element={<StudentsIndex />} />
    <Route path="/faculty/students/:id" element={<StudentDetails />} />
    <Route path="/faculty/attendance" element={<Attendance />} />
    <Route path="/faculty/gradebook" element={<Gradebook />} />
    <Route path="/faculty/announcements" element={<Announcements />} />
    <Route path="/faculty/resources" element={<Resources />} />
  </Route>
);
