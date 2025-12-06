// Assignment Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assignmentsAPI } from '../../api';

// Async thunks
export const fetchAssignments = createAsyncThunk('assignments/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.getAllAssignments(params);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchAssignmentById = createAsyncThunk('assignments/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.getAssignmentById(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createAssignment = createAsyncThunk('assignments/create', async (data, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.createAssignment(data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateAssignment = createAsyncThunk('assignments/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.updateAssignment(id, data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteAssignment = createAsyncThunk('assignments/delete', async (id, { rejectWithValue }) => {
  try {
    await assignmentsAPI.deleteAssignment(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const submitAssignment = createAsyncThunk('assignments/submit', async ({ id, formData }, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.submitAssignment(id, formData);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchSubmissions = createAsyncThunk('assignments/fetchSubmissions', async (id, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.getSubmissions(id);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const gradeSubmission = createAsyncThunk('assignments/grade', async ({ assignmentId, submissionId, data }, { rejectWithValue }) => {
  try {
    return await assignmentsAPI.gradeSubmission(assignmentId, submissionId, data);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    submissions: [],
    loading: false,
    submitting: false,
    error: null,
    filters: {
      status: 'all',
      course: '',
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
      state.submissions = [];
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.assignments || action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch assignment by ID
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.currentAssignment = action.payload;
      })
      // Create assignment
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.push(action.payload);
      })
      // Update assignment
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.assignments[index] = action.payload;
      })
      // Delete assignment
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(a => a._id !== action.payload);
      })
      // Submit assignment
      .addCase(submitAssignment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitAssignment.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Fetch submissions
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      // Grade submission
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        const index = state.submissions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.submissions[index] = action.payload;
      });
  },
});

export const { clearError, clearCurrentAssignment, setFilters } = assignmentSlice.actions;
export default assignmentSlice.reducer;
