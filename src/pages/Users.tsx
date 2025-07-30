import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Checkbox,
  TableSortLabel,
  Tooltip,
  Avatar,
  Stack,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../store/store';
import { addUser, updateUser, deleteUser } from '../store/slices/userSlice';
import { trackActivity, formatTimeAgo, getActivityIcon } from '../utils/activityUtils';

interface UserFormValues {
  name: string;
  email: string;
  role: string;
  status: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required'),
});

const roles = ['admin', 'user', 'editor'];
const statuses = ['active', 'inactive'];

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  const activities = useSelector((state: RootState) => state.activity.activities);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [detailsUser, setDetailsUser] = useState<any>(null);

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    formik.resetForm();
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    formik.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setOpen(true);
  };

  const handleDelete = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    dispatch(deleteUser(userId));
    
    if (userToDelete) {
      trackActivity({
        action: 'User Deleted',
        description: `User ${userToDelete.name} was removed from the system`,
        userId: userToDelete.id,
        userName: userToDelete.name,
        actionType: 'user_deleted',
        severity: 'error'
      });
    }
    
    setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
  };

  const handleBulkDelete = () => {
    const usersToDelete = users.filter(user => selected.includes(user.id));
    selected.forEach(id => dispatch(deleteUser(id)));
    
    usersToDelete.forEach(user => {
      trackActivity({
        action: 'User Deleted',
        description: `User ${user.name} was removed from the system (bulk delete)`,
        userId: user.id,
        userName: user.name,
        actionType: 'user_deleted',
        severity: 'error'
      });
    });
    
    setSnackbar({ open: true, message: 'Selected users deleted', severity: 'success' });
    setSelected([]);
  };

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status'],
      ...filteredUsers.map(u => [u.name, u.email, u.role, u.status]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Exported to CSV', severity: 'success' });
  };

  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: '',
      email: '',
      role: 'user',
      status: 'active',
    },
    validationSchema,
    onSubmit: (values) => {
      if (editingUser) {
        const oldUser = users.find(user => user.id === editingUser.id);
        dispatch(updateUser({ id: editingUser.id, ...values }));
        
        trackActivity({
          action: 'User Updated',
          description: `User ${values.name} was updated${oldUser && oldUser.status !== values.status ? ` (status changed from ${oldUser.status} to ${values.status})` : ''}`,
          userId: editingUser.id,
          userName: values.name,
          actionType: 'user_updated',
          severity: 'warning'
        });
        
        setSnackbar({ open: true, message: 'User updated', severity: 'success' });
      } else {
        const newUser = { id: Date.now().toString(), ...values };
        dispatch(addUser(newUser));
        
        trackActivity({
          action: 'User Added',
          description: `New user ${values.name} was added to the system`,
          userId: newUser.id,
          userName: values.name,
          actionType: 'user_added',
          severity: 'success'
        });
        
        setSnackbar({ open: true, message: 'User added', severity: 'success' });
      }
      handleClose();
    },
  });

  // Filtering, searching, sorting
  let filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter ? user.role === roleFilter : true) &&
    (statusFilter ? user.status === statusFilter : true)
  );
  filteredUsers = filteredUsers.sort((a, b) => {
    const valA = a[sortBy].toLowerCase();
    const valB = b[sortBy].toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'name' | 'email' | 'role') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? filteredUsers.map(u => u.id) : []);
  };
  const handleSelect = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  // Get user-specific activities
  const getUserActivities = (userId: string) => {
    return activities.filter(activity => activity.userId === userId).slice(0, 5);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Typography variant="h4">Users</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            size="small"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {roles.map(role => <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>)}
          </TextField>
          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map(status => <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>)}
          </TextField>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add User
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === filteredUsers.length && filteredUsers.length > 0}
                  indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortDir : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'email'}
                  direction={sortBy === 'email' ? sortDir : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'role'}
                  direction={sortBy === 'role' ? sortDir : 'asc'}
                  onClick={() => handleSort('role')}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} selected={selected.includes(user.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(user.id)}
                    onChange={() => handleSelect(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: user.role === 'admin' ? 'primary.main' : user.role === 'editor' ? 'warning.main' : 'grey.400' }}>
                      {user.name[0]}
                    </Avatar>
                    <Typography>{user.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : user.role === 'editor' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Details">
                    <IconButton onClick={() => setDetailsUser(user)} color="info">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteSweepIcon />}
          disabled={selected.length === 0}
          onClick={handleBulkDelete}
        >
          Delete Selected
        </Button>
        <Typography variant="body2" color="text.secondary">
          {filteredUsers.length} user(s) found
        </Typography>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={!!detailsUser} onClose={() => setDetailsUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {detailsUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: detailsUser.role === 'admin' ? 'primary.main' : detailsUser.role === 'editor' ? 'warning.main' : 'grey.400', mb: 1 }}>
                {detailsUser.name[0]}
              </Avatar>
              <Typography variant="h6">{detailsUser.name}</Typography>
              <Typography color="text.secondary">{detailsUser.email}</Typography>
              <Chip label={detailsUser.role} color={detailsUser.role === 'admin' ? 'primary' : detailsUser.role === 'editor' ? 'warning' : 'default'} size="small" sx={{ mt: 1 }} />
              <Chip label={detailsUser.status} color={detailsUser.status === 'active' ? 'success' : 'error'} size="small" sx={{ mt: 1 }} />
              <Divider sx={{ width: '100%', my: 2 }} />
              <Typography variant="subtitle2" sx={{ alignSelf: 'flex-start' }}>Recent Activity</Typography>
              <Box sx={{ width: '100%' }}>
                {getUserActivities(detailsUser.id).length > 0 ? (
                  getUserActivities(detailsUser.id).map(activity => (
                    <Box key={activity.id} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontSize: '0.8rem' }}>
                          {getActivityIcon(activity.actionType)}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {activity.description}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(activity.timestamp)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                    No recent activity
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default Users;