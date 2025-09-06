import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  LocalShipping,
  Check
} from '@mui/icons-material';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAuth } from '../contexts/AuthContext';

const ClaimShipment = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useSnackbar();
  const { login } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const fetchShipmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:3001/api/shipments/claim/${shipmentId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shipment not found');
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'This shipment cannot be claimed');
        } else {
          throw new Error('Failed to load shipment details');
        }
      }

      const data = await response.json();
      setShipment(data);
      setActiveStep(1); // Move to create account step
    } catch (err) {
      console.error('Failed to fetch shipment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchShipmentDetails();
  }, [fetchShipmentDetails]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      // Upgrade guest account
      const response = await fetch(`http://localhost:3001/api/account?upgrade=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shipment.guestEmail,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      const user = await response.json();
      
      // Now login the user
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shipment.guestEmail,
          password: formData.password
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Account created but login failed. Please try logging in manually.');
      }

      const loginData = await loginResponse.json();
      
      // Set token and user data
      localStorage.setItem('token', loginData.token);
      await login(loginData.token);

      setActiveStep(2); // Move to complete step
      showSuccess('Account created successfully! Your shipment has been claimed.');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Failed to create account:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !shipment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Claim Your Shipment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create an account to claim and track your shipment
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Verify Shipment */}
        <Step>
          <StepLabel>
            <Typography variant="h6">Verify Shipment Details</Typography>
          </StepLabel>
          <StepContent>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Please verify this is your shipment before proceeding.
            </Typography>
          </StepContent>
        </Step>

        {/* Step 2: Create Account */}
        <Step>
          <StepLabel>
            <Typography variant="h6">Create Your Account</Typography>
          </StepLabel>
          <StepContent>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Enter your details to create an account and claim your shipment.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={submitting}
                    helperText="Password must be at least 8 characters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={submitting}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ mr: 2 }}
                >
                  {submitting ? 'Creating Account...' : 'Create Account & Claim Shipment'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </StepContent>
        </Step>

        {/* Step 3: Complete */}
        <Step>
          <StepLabel>
            <Typography variant="h6">Account Created!</Typography>
          </StepLabel>
          <StepContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Welcome to Boxinator!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Your account has been created and your shipment has been claimed.
                Redirecting to your dashboard...
              </Typography>
            </Box>
          </StepContent>
        </Step>
      </Stepper>

      {/* Shipment Details Card */}
      {shipment && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Shipment Details
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Shipment ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  #{shipment.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  label={shipment.status} 
                  color={getStatusColor(shipment.status)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Receiver
                </Typography>
                <Typography variant="body1">
                  {shipment.receiverName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  {shipment.guestEmail}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Destination
                </Typography>
                <Typography variant="body1">
                  {shipment.destinationCountry?.name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Weight
                </Typography>
                <Typography variant="body1">
                  {shipment.weight} kg
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Cost
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {shipment.totalCost} Kr
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDate(shipment.createdAt)}
                </Typography>
              </Grid>
              
              {shipment.boxColor && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Box Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: shipment.boxColor,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300'
                      }}
                    />
                    <Typography variant="body1">
                      {shipment.boxColor}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ClaimShipment;
