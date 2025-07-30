import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { trackActivity } from '../utils/activityUtils';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogin = (email: string, password: string) => {
    // In a real application, you would make an API call here
    // For demo purposes, we'll simulate a successful login
    const user = {
      id: '1',
      email: email,
      name: 'Admin User',
      role: 'admin',
    };
    
    dispatch(login({
      user,
      token: 'dummy-token',
    }));
    
    trackActivity({
      action: 'User Login',
      description: 'Admin user logged into the system',
      userId: user.id,
      userName: user.name,
      actionType: 'login',
      severity: 'info'
    });
    
    navigate('/dashboard');
  };

  const handleLogout = () => {
    const currentUser = user;
    dispatch(logout());
    
    if (currentUser) {
      trackActivity({
        action: 'User Logout',
        description: 'Admin user logged out of the system',
        userId: currentUser.id,
        userName: currentUser.name,
        actionType: 'logout',
        severity: 'info'
      });
    }
    
    navigate('/login');
  };

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout,
  };
};