import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import api from '../services/api';

const Dashboard = () => {
  const [currentShipments, setCurrentShipments] = useState([]);
  const [completedShipments, setCompletedShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { showError } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      console.log('Fetching shipments...');
      
      const token = localStorage.getItem('token');
      
      const [currentResponse, completedResponse] = await Promise.all([
        fetch('http://localhost:3001/api/shipments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:3001/api/shipments/complete', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);
      
      if (!currentResponse.ok || !completedResponse.ok) {
        throw new Error(`HTTP ${currentResponse.status || completedResponse.status}`);
      }
      
      const [currentData, completedData] = await Promise.all([
        currentResponse.json(),
        completedResponse.json()
      ]);
      
      console.log('Shipments fetched successfully');
      setCurrentShipments(currentData);
      setCompletedShipments(completedData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch shipments:', err.message);
      setError('Failed to load shipments');
      showError('Failed to load shipments');
      
      // Don't auto-logout on shipment fetch errors
      if (err.status !== 401 && err.status !== 403) {
        // It's a different kind of error, not auth-related
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return 'info';
      case 'RECEIVED': return 'warning';
      case 'INTRANSIT': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLatestStatus = (shipment) => {
    if (shipment.statusHistory && shipment.statusHistory.length > 0) {
      return shipment.statusHistory[0].status;
    }
    return 'UNKNOWN';
  };

  const ShipmentTable = ({ shipments, title }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Receiver</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Weight</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary">
                  No {title.toLowerCase()} found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            shipments.map((shipment) => {
              const status = getLatestStatus(shipment);
              return (
                <TableRow key={shipment.id}>
                  <TableCell>#{shipment.id}</TableCell>
                  <TableCell>{shipment.receiverName}</TableCell>
                  <TableCell>{shipment.country?.name}</TableCell>
                  <TableCell>{shipment.weight}kg</TableCell>
                  <TableCell>{shipment.totalCost} Kr</TableCell>
                  <TableCell>
                    <Chip 
                      label={status} 
                      color={getStatusColor(status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/shipment/${shipment.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.firstName}!
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-shipment')}
        >
          Create Shipment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Shipments
              </Typography>
              <Typography variant="h4">
                {currentShipments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed Shipments
              </Typography>
              <Typography variant="h4">
                {completedShipments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4">
                {[...currentShipments, ...completedShipments]
                  .reduce((sum, shipment) => sum + shipment.totalCost, 0)} Kr
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Account Type
              </Typography>
              <Typography variant="h6">
                {user?.accountType === 'ADMINISTRATOR' ? 'Admin' : 
                 user?.accountType === 'REGISTERED_USER' ? 'User' : 'Guest'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shipments Tables */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="Current Shipments" />
            <Tab label="Completed Shipments" />
          </Tabs>
          
          {tabValue === 0 && (
            <ShipmentTable shipments={currentShipments} title="Current Shipments" />
          )}
          
          {tabValue === 1 && (
            <ShipmentTable shipments={completedShipments} title="Completed Shipments" />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
