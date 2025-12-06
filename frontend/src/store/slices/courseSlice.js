// Course Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coursesAPI } from '../../api';

// Async thunks
export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await coursesAPI.getAllCourses(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await coursesAPI.getCourseById(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createCourse = createAsyncThunk('courses/create', async (courseData, { rejectWithValue }) => {
  try {
    return await coursesAPI.createCourse(courseData);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateCourse = createAsyncThunk('courses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await coursesAPI.updateCourse(id, data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try {
    await coursesAPI.deleteCourse(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchEnrolledCourses = createAsyncThunk('courses/fetchEnrolled', async (_, { rejectWithValue }) => {
  try {
    return await coursesAPI.getEnrolledCourses();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    enrolledCourses: [],
    currentCourse: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      department: '',
      semester: '',
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { search: '', department: '', semester: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch course by ID
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      // Create course
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.push(action.payload);
      })
      // Update course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c._id !== action.payload);
      })
      // Fetch enrolled courses
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.enrolledCourses = action.payload;
      });
  },
});

export const { clearError, clearCurrentCourse, setFilters, clearFilters } = courseSlice.actions;
export default courseSlice.reducer;
