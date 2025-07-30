import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  useTheme,
  Button,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import { formatTimeAgo, getActivityIcon, getActivityColor } from '../utils/activityUtils';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const users = useSelector((state: RootState) => state.users.users);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const activities = useSelector((state: RootState) => state.activity.activities);
  const navigate = useNavigate();

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const editorCount = users.filter(user => user.role === 'editor').length;
  const newUsersThisMonth = users.filter(user => Number(user.id) > 3).length; // Mock logic

  // Prepare data for pie chart
  const pieData = [
    {
      id: 'active',
      label: 'Active Users',
      value: activeUsers,
      color: theme.palette.success.main,
    },
    {
      id: 'inactive',
      label: 'Inactive Users',
      value: inactiveUsers,
      color: theme.palette.error.main,
    },
  ];

  // Mock data for line chart (user growth over time)
  const lineData = [
    {
      id: 'user growth',
      color: theme.palette.primary.main,
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 15 },
        { x: 'Mar', y: 25 },
        { x: 'Apr', y: 30 },
        { x: 'May', y: totalUsers },
      ],
    },
  ];

  // Get recent activities (last 10)
  const recentActivities = activities.slice(0, 10);

  // Card click handlers
  const handleCardClick = (filter: string) => {
    navigate(`/users?filter=${filter}`);
  };

  return (
    <Box>
      {/* Welcome message */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
          {authUser?.name ? authUser.name[0] : <PersonIcon fontSize="large" />}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Welcome back, {authUser?.name || 'Admin'}!
          </Typography>
          <Typography color="text.secondary">Here's an overview of your admin dashboard.</Typography>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
        {/* Statistics Cards */}
        <Card sx={{ flex: 1, cursor: 'pointer', borderLeft: `6px solid ${theme.palette.primary.main}` }} onClick={() => handleCardClick('all')}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h3">{totalUsers}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, cursor: 'pointer', borderLeft: `6px solid ${theme.palette.success.main}` }} onClick={() => handleCardClick('new')}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              New Users This Month
            </Typography>
            <Typography variant="h3" sx={{ color: theme.palette.success.main }}>{newUsersThisMonth}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, cursor: 'pointer', borderLeft: `6px solid ${theme.palette.info.main}` }} onClick={() => handleCardClick('admin')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminPanelSettingsIcon color="info" />
              <Typography color="textSecondary" gutterBottom>
                Admins
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ color: theme.palette.info.main }}>{adminCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, cursor: 'pointer', borderLeft: `6px solid ${theme.palette.warning.main}` }} onClick={() => handleCardClick('editor')}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon color="warning" />
              <Typography color="textSecondary" gutterBottom>
                Editors
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ color: theme.palette.warning.main }}>{editorCount}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3}>
        {/* Pie Chart */}
        <Card sx={{ flex: 1, minWidth: 300, height: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsivePie
                data={pieData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={theme.palette.text.primary}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#ffffff"
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: theme.palette.text.primary,
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                  },
                ]}
              />
            </Box>
          </CardContent>
        </Card>
        {/* Line Chart */}
        <Card sx={{ flex: 1, minWidth: 300, height: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Growth Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={lineData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 'auto',
                  max: 'auto',
                  stacked: false,
                  reverse: false,
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendOffset: 36,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Users',
                  legendOffset: -40,
                  legendPosition: 'middle',
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                      {
                        on: 'hover',
                        style: {
                          itemBackground: 'rgba(0, 0, 0, .03)',
                          itemOpacity: 1,
                        },
                      },
                    ],
                  },
                ]}
              />
            </Box>
          </CardContent>
        </Card>
        {/* Recent Activity Log */}
        <Card sx={{ flex: 1, minWidth: 300, height: 400, overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {getActivityIcon(activity.actionType)}
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {activity.description}
                      </Typography>
                      <Chip 
                        label={activity.action} 
                        size="small" 
                        sx={{ 
                          bgcolor: getActivityColor(activity.severity),
                          color: 'white',
                          fontSize: '0.7rem'
                        }} 
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No recent activity
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default Dashboard;