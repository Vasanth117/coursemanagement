import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import courseReducer from './slices/courseSlice';
import assignmentReducer from './slices/assignmentSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    courses: courseReducer,
    assignments: assignmentReducer,
    enrollments: enrollmentReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/openModal'],
        ignoredPaths: ['ui.modal.data'],
      },
    }),
});

export default store;
