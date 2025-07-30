import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  actionType: 'user_added' | 'user_updated' | 'user_deleted' | 'login' | 'logout' | 'password_changed' | 'profile_updated';
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [
    {
      id: '1',
      action: 'User Login',
      description: 'Admin user logged into the system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      userId: '1',
      userName: 'Admin User',
      actionType: 'login',
      severity: 'info'
    },
    {
      id: '2',
      action: 'User Added',
      description: 'New user Sarah Wilson was added to the system',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      userId: '4',
      userName: 'Sarah Wilson',
      actionType: 'user_added',
      severity: 'success'
    },
    {
      id: '3',
      action: 'User Updated',
      description: 'User Mike Johnson status changed to inactive',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      userId: '3',
      userName: 'Mike Johnson',
      actionType: 'user_updated',
      severity: 'warning'
    },
    {
      id: '4',
      action: 'Password Changed',
      description: 'Admin user changed their password',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      userId: '1',
      userName: 'Admin User',
      actionType: 'password_changed',
      severity: 'info'
    },
    {
      id: '5',
      action: 'User Deleted',
      description: 'User Tom Brown was removed from the system',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      userId: '5',
      userName: 'Tom Brown',
      actionType: 'user_deleted',
      severity: 'error'
    },
    {
      id: '6',
      action: 'Profile Updated',
      description: 'Admin user updated their profile information',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      userId: '1',
      userName: 'Admin User',
      actionType: 'profile_updated',
      severity: 'info'
    }
  ],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Omit<Activity, 'id' | 'timestamp'>>) => {
      const newActivity: Activity = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      state.activities.unshift(newActivity); // Add to beginning of array
      
      // Keep only the last 50 activities
      if (state.activities.length > 50) {
        state.activities = state.activities.slice(0, 50);
      }
    },
    clearActivities: (state) => {
      state.activities = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addActivity,
  clearActivities,
  setLoading,
  setError,
} = activitySlice.actions;

export default activitySlice.reducer; 