import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person,
  Email,
  Cake,
  Shield,
  Security,
  Edit,
  Save,
  Cancel,
  AdminPanelSettings,
  Key,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        email: user.email || ''
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/account/me/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/account/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await refreshUser();
        setEditing(false);
        showSuccess('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      showError('Failed to update profile');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showSuccess('Password changed successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  const toggle2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.twoFactorEnabled ? 'disable-2fa' : 'enable-2fa';
      
      const response = await fetch(`http://localhost:3001/api/account/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshUser();
        showSuccess(`2FA ${user.twoFactorEnabled ? 'disabled' : 'enabled'} successfully!`);
      } else {
        throw new Error('Failed to toggle 2FA');
      }
    } catch (error) {
      showError('Failed to update 2FA settings');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountTypeColor = (accountType) => {
    switch (accountType) {
      case 'ADMINISTRATOR': return 'error';
      case 'REGISTERED_USER': return 'primary';
      case 'GUEST': return 'default';
      default: return 'default';
    }
  };

  const getAccountTypeIcon = (accountType) => {
    switch (accountType) {
      case 'ADMINISTRATOR': return <AdminPanelSettings />;
      case 'REGISTERED_USER': return <Person />;
      case 'GUEST': return <Person />;
      default: return <Person />;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and security settings
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Profile Information" />
          <Tab label="Security Settings" />
          {user.accountType === 'ADMINISTRATOR' && <Tab label="Admin Tools" />}
        </Tabs>
      </Box>

      {/* Profile Information Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3,
                      bgcolor: getAccountTypeColor(user.accountType) + '.main'
                    }}
                  >
                    {getAccountTypeIcon(user.accountType)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {user.email}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        icon={getAccountTypeIcon(user.accountType)}
                        label={user.accountType.replace('_', ' ')}
                        color={getAccountTypeColor(user.accountType)}
                        size="small"
                      />
                      {user.isEmailVerified ? (
                        <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
                      ) : (
                        <Chip icon={<Warning />} label="Unverified" color="warning" size="small" />
                      )}
                      {user.twoFactorEnabled && (
                        <Chip icon={<Shield />} label="2FA Enabled" color="info" size="small" />
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                  <Typography variant="h6">Personal Information</Typography>
                  <Button
                    startIcon={editing ? <Cancel /> : <Edit />}
                    onClick={() => setEditing(!editing)}
                    color={editing ? "secondary" : "primary"}
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <Cake sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Box mt={3} display="flex" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Account Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Account Statistics</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText 
                      primary="Member Since" 
                      secondary={formatDate(user.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText 
                      primary="Email Status" 
                      secondary={user.isEmailVerified ? "Verified" : "Unverified"}
                    />
                  </ListItem>
                  {userStats && (
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText 
                        primary="Total Shipments" 
                        secondary={userStats.totalShipments || 0}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon><Shield /></ListItemIcon>
                    <ListItemText 
                      primary="2FA Status" 
                      secondary={user.twoFactorEnabled ? "Enabled" : "Disabled"}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Security Settings Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Key sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Password Security
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Keep your account secure with a strong password
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add an extra layer of security to your account
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={user.twoFactorEnabled}
                      onChange={toggle2FA}
                    />
                  }
                  label={user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>Security Recommendations</Typography>
              <Typography variant="body2">
                • Use a strong password with at least 8 characters<br/>
                • Enable two-factor authentication for enhanced security<br/>
                • Regularly review your account activity<br/>
                • Never share your login credentials
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {/* Admin Tools Tab */}
      {activeTab === 2 && user.accountType === 'ADMINISTRATOR' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Administrator Tools
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Additional tools and information available to administrators
                </Typography>
                
                <Stack spacing={2}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2">Administrator Account</Typography>
                    <Typography variant="body2">
                      You have administrator privileges. Use these responsibly and keep your account secure.
                    </Typography>
                  </Alert>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
                    <Button variant="outlined" sx={{ mr: 1, mb: 1 }}>
                      View System Logs
                    </Button>
                    <Button variant="outlined" sx={{ mr: 1, mb: 1 }}>
                      User Management
                    </Button>
                    <Button variant="outlined" sx={{ mr: 1, mb: 1 }}>
                      System Settings
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type={showPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
              }
              label="Show passwords"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained"
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {loading ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
