// Enrollment Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enrollmentsAPI } from '../../api';

// Async thunks
export const enrollCourse = createAsyncThunk('enrollments/enroll', async (courseId, { rejectWithValue }) => {
  try {
    return await enrollmentsAPI.enrollCourse(courseId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const unenrollCourse = createAsyncThunk('enrollments/unenroll', async (enrollmentId, { rejectWithValue }) => {
  try {
    await enrollmentsAPI.unenrollCourse(enrollmentId);
    return enrollmentId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchStudentEnrollments = createAsyncThunk('enrollments/fetchStudent', async (_, { rejectWithValue }) => {
  try {
    return await enrollmentsAPI.getStudentEnrollments();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchCourseEnrollments = createAsyncThunk('enrollments/fetchCourse', async (courseId, { rejectWithValue }) => {
  try {
    return await enrollmentsAPI.getCourseEnrollments(courseId);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState: {
    enrollments: [],
    courseEnrollments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCourseEnrollments: (state) => {
      state.courseEnrollments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Enroll course
      .addCase(enrollCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload);
      })
      .addCase(enrollCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unenroll course
      .addCase(unenrollCourse.fulfilled, (state, action) => {
        state.enrollments = state.enrollments.filter(e => e._id !== action.payload);
      })
      // Fetch student enrollments
      .addCase(fetchStudentEnrollments.fulfilled, (state, action) => {
        state.enrollments = action.payload;
      })
      // Fetch course enrollments
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.courseEnrollments = action.payload;
      });
  },
});

export const { clearError, clearCourseEnrollments } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
