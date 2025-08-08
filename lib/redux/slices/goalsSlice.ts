import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Goal } from '@/lib/types';
import { goalsApi } from '@/lib/api/goals';

// Define the state type
interface GoalsState {
  items: Goal[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: GoalsState = {
  items: [],
  status: 'idle',
  error: null,
};

// Create async thunk for fetching goals
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const goals = await goalsApi.getGoals();
      return goals;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch goals');
    }
  }
);

// Create the goals slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // You can add additional reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default goalsSlice.reducer;
