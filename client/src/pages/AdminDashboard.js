import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AdminPanelSettings,
  LocalShipping,
  People,
  AttachMoney,
  Refresh,
  Edit,
  Public
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [shipments, setShipments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalUsers: 0,
    totalCountries: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dialogs
  const [shipmentDialog, setShipmentDialog] = useState(false);
  const [countryDialog, setCountryDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newMultiplier, setNewMultiplier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch shipments
      const shipmentsResponse = await fetch('http://localhost:3001/api/shipments', {
        headers
      });
      
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json();
        setShipments(shipmentsData);
        setStats(prev => ({ ...prev, totalShipments: shipmentsData.length }));
      }

      // Fetch countries
      const countriesResponse = await fetch('http://localhost:3001/api/countries', {
        headers
      });
      
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData);
        setStats(prev => ({ ...prev, totalCountries: countriesData.length }));
      }

      // Fetch users (admin only)
      if (user?.accountType === 'ADMINISTRATOR') {
        const usersResponse = await fetch('http://localhost:3001/api/account', {
          headers
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
          setStats(prev => ({ ...prev, totalUsers: usersData.length }));
        }
      }

      // Calculate total revenue
      const revenue = shipments.reduce((total, shipment) => {
        return total + (shipment.totalCost || 0);
      }, 0);
      setStats(prev => ({ ...prev, totalRevenue: revenue }));

    } catch (err) {
      setError('Failed to load dashboard data');
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShipmentUpdate = async () => {
    if (!selectedShipment || !newStatus) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/shipments/${selectedShipment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: adminNotes
        })
      });

      if (response.ok) {
        showSuccess('Shipment updated successfully');
        setShipmentDialog(false);
        fetchData();
      } else {
        showError('Failed to update shipment');
      }
    } catch (err) {
      showError('Failed to update shipment');
    }
  };

  const handleCountryUpdate = async () => {
    if (!selectedCountry || !newMultiplier) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/countries/${selectedCountry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          multiplier: parseFloat(newMultiplier)
        })
      });

      if (response.ok) {
        showSuccess('Country multiplier updated successfully');
        setCountryDialog(false);
        fetchData();
      } else {
        showError('Failed to update country multiplier');
      }
    } catch (err) {
      showError('Failed to update country multiplier');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return 'info';
      case 'PENDING': return 'warning';
      case 'IN_TRANSIT': return 'info';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage shipments, countries, and users
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalShipments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Shipments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Public sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalCountries}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Countries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Shipment Management" />
          <Tab label="Country Settings" />
          <Tab label="User Management" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Shipment Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>{shipment.id}</TableCell>
                      <TableCell>
                        {shipment.sourceCountry?.name || shipment.sourceCountryId}
                      </TableCell>
                      <TableCell>
                        {shipment.destinationCountry?.name || shipment.destinationCountryId}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={shipment.status}
                          color={getStatusColor(shipment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {shipment.totalCost ? formatCurrency(shipment.totalCost) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Shipment">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              setNewStatus(shipment.status);
                              setAdminNotes(shipment.adminNotes || '');
                              setShipmentDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Country Settings
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Multiplier</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {countries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell>{country.name}</TableCell>
                      <TableCell>{country.countryCode}</TableCell>
                      <TableCell>{country.multiplier?.toFixed(2) || '1.00'}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Multiplier">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCountry(country);
                              setNewMultiplier(country.multiplier?.toString() || '1.0');
                              setCountryDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            {user?.accountType !== 'ADMINISTRATOR' ? (
              <Alert severity="warning">
                You don't have permission to view user management.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Verified</TableCell>
                      <TableCell>2FA</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>{userData.id}</TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={userData.accountType}
                            color={userData.accountType === 'ADMINISTRATOR' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userData.isEmailVerified ? 'Yes' : 'No'}
                            color={userData.isEmailVerified ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={userData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            color={userData.twoFactorEnabled ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      )}

      {/* Shipment Edit Dialog */}
      <Dialog 
        open={shipmentDialog} 
        onClose={() => setShipmentDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
        aria-labelledby="shipment-dialog-title"
      >
        <DialogTitle id="shipment-dialog-title">Edit Shipment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="RECEIVED">Received</MenuItem>
              <MenuItem value="INTRANSIT">In Transit</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Admin Notes"
            multiline
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes about this shipment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShipmentDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleShipmentUpdate} variant="contained">
            Update Shipment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Country Edit Dialog */}
      <Dialog 
        open={countryDialog} 
        onClose={() => setCountryDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus
        aria-labelledby="country-dialog-title"
      >
        <DialogTitle id="country-dialog-title">Edit Country Multiplier</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Price Multiplier"
            type="number"
            value={newMultiplier}
            onChange={(e) => setNewMultiplier(e.target.value)}
            inputProps={{ step: '0.1', min: '0.1', max: '10.0' }}
            sx={{ mt: 2 }}
            helperText="Multiplier affects shipping costs to this country"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountryDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCountryUpdate} variant="contained">
            Update Multiplier
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
