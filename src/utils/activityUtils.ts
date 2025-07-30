import { addActivity } from '../store/slices/activitySlice';
import { store } from '../store/store';

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

export const trackActivity = (activityData: {
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  actionType: 'user_added' | 'user_updated' | 'user_deleted' | 'login' | 'logout' | 'password_changed' | 'profile_updated';
  severity: 'info' | 'success' | 'warning' | 'error';
}) => {
  store.dispatch(addActivity(activityData));
};

export const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'user_added':
      return '👤';
    case 'user_updated':
      return '✏️';
    case 'user_deleted':
      return '🗑️';
    case 'login':
      return '🔐';
    case 'logout':
      return '🚪';
    case 'password_changed':
      return '🔒';
    case 'profile_updated':
      return '👤';
    default:
      return '📝';
  }
};

export const getActivityColor = (severity: string) => {
  switch (severity) {
    case 'success':
      return '#4caf50';
    case 'warning':
      return '#ff9800';
    case 'error':
      return '#f44336';
    case 'info':
    default:
      return '#2196f3';
  }
}; 