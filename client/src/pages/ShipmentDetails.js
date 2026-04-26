import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack
} from '@mui/material';
import {
  LocalShipping,
  ArrowBack,
  Print,
  FileDownload,
  Edit,
  Check,
  Pending,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateDialog, setUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/shipments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shipment not found');
        } else if (response.status === 403) {
          throw new Error('You do not have access to this shipment');
        } else {
          throw new Error('Failed to load shipment details');
        }
      }

      const data = await response.json();
      setShipment(data);
      setNewStatus(getLatestStatus(data));
      setAdminNotes(data.adminNotes || '');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLatestStatus = (shipmentData) => {
    if (shipmentData.statusHistory && shipmentData.statusHistory.length > 0) {
      return shipmentData.statusHistory[0].status;
    }
    return 'CREATED';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return 'info';
      case 'RECEIVED': return 'warning';
      case 'INTRANSIT':
      case 'IN_TRANSIT': return 'primary';
      case 'DELIVERED':
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED': return <Pending />;
      case 'RECEIVED': return <Warning />;
      case 'INTRANSIT':
      case 'IN_TRANSIT': return <LocalShipping />;
      case 'DELIVERED':
      case 'COMPLETED': return <CheckCircle />;
      case 'CANCELLED': return <Cancel />;
      default: return <Pending />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/shipments/${shipmentId}`, {
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
        setUpdateDialog(false);
        fetchShipmentDetails();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipment');
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Create a simple text-based receipt
    const receipt = `
BOXINATOR - SHIPMENT RECEIPT
================================
Order ID: ${shipment.id}
Date: ${formatDate(shipment.createdAt)}

RECIPIENT INFORMATION
Receiver Name: ${shipment.receiverName || 'N/A'}
Email: ${shipment.user?.email || 'N/A'}

SHIPMENT DETAILS
Destination: ${shipment.destinationCountry?.name || 'N/A'}
Weight: ${shipment.weight}kg
Total Cost: ${shipment.totalCost} Kr
Box Color: ${shipment.boxColor}

CURRENT STATUS
Status: ${getLatestStatus(shipment)}
Last Updated: ${shipment.statusHistory?.[0]?.createdAt ? formatDate(shipment.statusHistory[0].createdAt) : 'N/A'}

STATUS HISTORY
${shipment.statusHistory?.map(sh => `  • ${sh.status} - ${formatDate(sh.createdAt)}`).join('\n') || 'No history'}

Thank you for choosing Boxinator!
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receipt));
    element.setAttribute('download', `shipment-${shipment.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!shipment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="warning">Shipment not found</Alert>
      </Container>
    );
  }

  const currentStatus = getLatestStatus(shipment);
  const isAdmin = user?.accountType === 'ADMINISTRATOR';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              Shipment Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order ID: {shipment.id}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleDownloadReceipt}
          >
            Download
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setUpdateDialog(true)}
            >
              Update Status
            </Button>
          )}
        </Stack>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Shipment Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipment Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Receiver Name
                  </Typography>
                  <Typography variant="body1">
                    {shipment.receiverName || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {shipment.user?.email || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Destination
                  </Typography>
                  <Typography variant="body1">
                    {shipment.destinationCountry?.name || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weight
                  </Typography>
                  <Typography variant="body1">
                    {shipment.weight} kg
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {shipment.totalCost} Kr
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Box Color
                  </Typography>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: shipment.boxColor,
                      borderRadius: 1,
                      border: '1px solid #ccc'
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(shipment.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {getStatusIcon(currentStatus)}
                </Box>
                <Chip
                  label={currentStatus}
                  color={getStatusColor(currentStatus)}
                  size="large"
                  icon={getStatusIcon(currentStatus)}
                />
              </Box>

              {shipment.statusHistory && shipment.statusHistory.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {formatDate(shipment.statusHistory[0].createdAt)}
                  </Typography>
                </Box>
              )}

              {isAdmin && shipment.adminNotes && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Admin Notes
                  </Typography>
                  <Typography variant="body2">
                    {shipment.adminNotes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status History
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {shipment.statusHistory && shipment.statusHistory.length > 0 ? (
            <Stepper orientation="vertical">
              {shipment.statusHistory.map((status, index) => (
                <Step key={index} active={true} completed={index !== 0}>
                  <StepLabel
                    icon={getStatusIcon(status.status)}
                    StepIconProps={{
                      sx: {
                        color: getStatusColor(status.status) + '.main'
                      }
                    }}
                  >
                    <Typography variant="subtitle2">
                      {status.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(status.createdAt)}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No status history available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog
        open={updateDialog}
        onClose={() => setUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            select
            fullWidth
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mb: 2 }}
            SelectProps={{
              native: true
            }}
          >
            <option value="">Select a status</option>
            <option value="CREATED">Created</option>
            <option value="RECEIVED">Received</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </TextField>

          <TextField
            fullWidth
            label="Admin Notes"
            multiline
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about this shipment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShipmentDetails;
