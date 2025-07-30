import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockUsers } from '../../mockData';
import { addActivity } from './activitySlice';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: mockUsers,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addActivity, () => {
      // This is handled by the activity slice
    });
  },
});

export const {
  addUser,
  updateUser,
  deleteUser,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;