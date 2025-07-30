import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  Alert,
  Avatar,
  IconButton,
  Snackbar,
  Stack,
  LinearProgress,
} from '@mui/material';
import { Grid } from '@mui/system';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { trackActivity } from '../utils/activityUtils';

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const Settings: React.FC = () => {
  const { user } = useAuth();

  // Profile editing state
  const [profile, setProfile] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: '',
  });
  const [editingProfile, setEditingProfile] = React.useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Password change form validation schema
  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Password change form handling
  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      trackActivity({
        action: 'Password Changed',
        description: 'Admin user changed their password',
        userId: user?.id,
        userName: user?.name,
        actionType: 'password_changed',
        severity: 'info'
      });
      
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
      formik.resetForm();
    },
  });

  // Notification settings
  const [notifications, setNotifications] = React.useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      pushNotifications: true,
      updates: true,
      security: true,
    };
  });

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updated = {
      ...notifications,
      [event.target.name]: event.target.checked,
    };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    setSnackbar({ open: true, message: 'Notification settings updated', severity: 'success' });
  };

  // Theme settings
  const [darkMode, setDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
    localStorage.setItem('darkMode', JSON.stringify(event.target.checked));
    setSnackbar({ open: true, message: 'Theme preference saved', severity: 'success' });
  };

  // Profile editing handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile({ ...profile, avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  const handleProfileSave = () => {
    trackActivity({
      action: 'Profile Updated',
      description: 'Admin user updated their profile information',
      userId: user?.id,
      userName: user?.name,
      actionType: 'profile_updated',
      severity: 'info'
    });
    
    setEditingProfile(false);
    setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
  };

  // Password strength
  const passwordStrength = getPasswordStrength(formik.values.newPassword);
  const passwordStrengthLabel = ['Weak', 'Fair', 'Good', 'Strong'];
  const passwordStrengthColor = ['error', 'warning', 'info', 'success'];

  // Sync profile with user changes
  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      avatar: '',
    });
  }, [user]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr'
          }
        }}>
          {/* Account Information */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar src={profile.avatar} sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                    {profile.name[0]}
                  </Avatar>
                  {editingProfile ? (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload">
                        <Button variant="outlined" component="span" size="small">Change Avatar</Button>
                      </label>
                    </>
                  ) : null}
                </Stack>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    fullWidth
                    disabled={!editingProfile}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  {editingProfile ? (
                    <Button startIcon={<SaveIcon />} variant="contained" onClick={handleProfileSave}>Save</Button>
                  ) : (
                    <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Password Change */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <form onSubmit={formik.handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="currentPassword"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                    helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                  />
                  {/* Password strength meter */}
                  {formik.values.newPassword && (
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={((passwordStrength + 1) / 4) * 100}
                        color={passwordStrengthColor[passwordStrength - 1] as any}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color={passwordStrengthColor[passwordStrength - 1] as any}>
                        Strength: {passwordStrengthLabel[passwordStrength - 1] || 'Weak'}
                      </Typography>
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Change Password
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={handleNotificationChange}
                      name="pushNotifications"
                      color="primary"
                    />
                  }
                  label="Push Notifications"
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.updates}
                      onChange={handleNotificationChange}
                      name="updates"
                      color="primary"
                    />
                  }
                  label="Product Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.security}
                      onChange={handleNotificationChange}
                      name="security"
                      color="primary"
                    />
                  }
                  label="Security Alerts"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleThemeChange}
                      name="darkMode"
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  Theme changes will take effect on the next page reload.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
      {/* Snackbars */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;