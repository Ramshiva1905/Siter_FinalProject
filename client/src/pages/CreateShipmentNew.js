import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  LocalShipping,
  Person,
  Scale,
  Public,
  Palette,
  Receipt,
  Send
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
// Removed api import since we're using direct fetch calls

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    receiverName: '',
    weight: '',
    boxColor: 'rgba(255, 0, 0, 1)',
    countryId: '',
    guestEmail: ''
  });
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cost, setCost] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { user, isGuest } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const navigate = useNavigate();

  const steps = ['Recipient Details', 'Package Details', 'Review & Submit'];

  const weightTiers = [
    { 
      value: '1', 
      label: 'Basic (1kg)', 
      description: 'Small mystery box',
      icon: '📦',
      price: 'Starting from 200 Kr'
    },
    { 
      value: '2', 
      label: 'Humble (2kg)', 
      description: 'Medium mystery box',
      icon: '📫',
      price: 'Starting from 200 Kr'
    },
    { 
      value: '5', 
      label: 'Deluxe (5kg)', 
      description: 'Large mystery box',
      icon: '📦',
      price: 'Starting from 200 Kr'
    },
    { 
      value: '8', 
      label: 'Premium (8kg)', 
      description: 'Extra large mystery box',
      icon: '📮',
      price: 'Starting from 200 Kr'
    }
  ];

  const boxColors = [
    { value: 'rgba(255, 0, 0, 1)', label: 'Red', color: '#ff0000' },
    { value: 'rgba(0, 255, 0, 1)', label: 'Green', color: '#00ff00' },
    { value: 'rgba(0, 0, 255, 1)', label: 'Blue', color: '#0000ff' },
    { value: 'rgba(255, 255, 0, 1)', label: 'Yellow', color: '#ffff00' },
    { value: 'rgba(255, 0, 255, 1)', label: 'Purple', color: '#ff00ff' },
    { value: 'rgba(0, 255, 255, 1)', label: 'Cyan', color: '#00ffff' },
    { value: 'rgba(255, 165, 0, 1)', label: 'Orange', color: '#ffa500' },
    { value: 'rgba(128, 0, 128, 1)', label: 'Dark Purple', color: '#800080' }
  ];

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.weight && formData.countryId) {
      calculateCost();
    }
  }, [formData.weight, formData.countryId]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/countries?active=true');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      console.error('Failed to load countries:', err);
      showError('Failed to load countries');
    }
  };

  const calculateCost = () => {
    const selectedCountry = countries.find(c => c.id === parseInt(formData.countryId));
    if (selectedCountry && formData.weight) {
      const flatFee = 200;
      const calculatedCost = flatFee + (parseFloat(formData.weight) * selectedCountry.multiplier);
      setCost(calculatedCost);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.receiverName.trim()) {
      setError('Receiver name is required');
      setCurrentStep(0);
      return;
    }

    if (!formData.weight) {
      setError('Please select a weight tier');
      setCurrentStep(1);
      return;
    }

    if (!formData.countryId) {
      setError('Please select a destination country');
      setCurrentStep(1);
      return;
    }

    if (!user && !formData.guestEmail) {
      setError('Guest email is required for anonymous shipments');
      setCurrentStep(0);
      return;
    }

    if (formData.guestEmail && !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      setError('Please enter a valid email address');
      setCurrentStep(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const shipmentData = {
        receiverName: formData.receiverName.trim(),
        weight: parseFloat(formData.weight),
        boxColor: formData.boxColor,
        countryId: parseInt(formData.countryId),
        ...(isGuest() || !user ? { guestEmail: formData.guestEmail.trim() } : {})
      };

      console.log('Submitting shipment data:', shipmentData);
      const response = await api.shipments.create(shipmentData);
      console.log('Shipment created:', response);
      showSuccess('Shipment created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create shipment:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create shipment';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.receiverName.trim()) {
        setError('Receiver name is required');
        return;
      }
      if (!user && !formData.guestEmail) {
        setError('Guest email is required');
        return;
      }
      if (formData.guestEmail && !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.weight) {
        setError('Please select a weight tier');
        return;
      }
      if (!formData.countryId) {
        setError('Please select a destination country');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 64, height: 64 }}>
          <LocalShipping sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Create New Shipment
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Send your mystery box anywhere in the world
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              {/* Step 0: Recipient Details */}
              {currentStep === 0 && (
                <Card elevation={1}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Person sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight="bold">
                        Recipient Information
                      </Typography>
                    </Box>
                    
                    <Stack spacing={3}>
                      <TextField
                        required
                        fullWidth
                        name="receiverName"
                        label="Receiver Full Name"
                        value={formData.receiverName}
                        onChange={handleChange}
                        disabled={loading}
                        variant="outlined"
                        helperText="Enter the full name of the person receiving the package"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />

                      {(isGuest() || !user) && (
                        <TextField
                          required
                          fullWidth
                          name="guestEmail"
                          label="Your Email Address"
                          type="email"
                          value={formData.guestEmail}
                          onChange={handleChange}
                          disabled={loading}
                          variant="outlined"
                          helperText="We'll send you a receipt and tracking information"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Step 1: Package Details */}
              {currentStep === 1 && (
                <Stack spacing={3}>
                  <Card elevation={1}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Scale sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h5" fontWeight="bold">
                          Choose Weight Tier
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        {weightTiers.map((tier) => (
                          <Grid item xs={12} sm={6} key={tier.value}>
                            <Card 
                              variant={formData.weight === tier.value ? "elevation" : "outlined"}
                              sx={{ 
                                cursor: 'pointer', 
                                transition: 'all 0.2s',
                                borderColor: formData.weight === tier.value ? 'primary.main' : 'divider',
                                borderWidth: formData.weight === tier.value ? 2 : 1,
                                '&:hover': { 
                                  boxShadow: 3,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                              onClick={() => setFormData({...formData, weight: tier.value})}
                            >
                              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Typography variant="h3" sx={{ mb: 1 }}>{tier.icon}</Typography>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                  {tier.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {tier.description}
                                </Typography>
                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                  {tier.price}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card elevation={1}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Public sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h5" fontWeight="bold">
                          Destination Country
                        </Typography>
                      </Box>
                      
                      <FormControl fullWidth required>
                        <InputLabel>Select Destination</InputLabel>
                        <Select
                          name="countryId"
                          value={formData.countryId}
                          onChange={handleChange}
                          disabled={loading}
                          sx={{ borderRadius: 2 }}
                        >
                          {countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>

                  <Card elevation={1}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Palette sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h5" fontWeight="bold">
                          Box Color
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={1}>
                        {boxColors.map((color) => (
                          <Grid item xs={3} sm={2} md={1.5} key={color.value}>
                            <Box
                              sx={{
                                width: '100%',
                                aspectRatio: '1',
                                bgcolor: color.color,
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: formData.boxColor === color.value ? '3px solid' : '2px solid',
                                borderColor: formData.boxColor === color.value ? 'primary.main' : 'grey.300',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: 2
                                }
                              }}
                              onClick={() => setFormData({...formData, boxColor: color.value})}
                              title={color.label}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Selected: {boxColors.find(c => c.value === formData.boxColor)?.label || 'Custom'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {/* Step 2: Review & Submit */}
              {currentStep === 2 && (
                <Card elevation={1}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Receipt sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" fontWeight="bold">
                        Review Your Shipment
                      </Typography>
                    </Box>
                    
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Recipient
                        </Typography>
                        <Typography variant="body1">{formData.receiverName}</Typography>
                      </Box>

                      {formData.guestEmail && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Contact Email
                          </Typography>
                          <Typography variant="body1">{formData.guestEmail}</Typography>
                        </Box>
                      )}

                      <Divider />

                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Package Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Weight Tier</Typography>
                            <Typography variant="body1">
                              {weightTiers.find(t => t.value === formData.weight)?.label || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Destination</Typography>
                            <Typography variant="body1">
                              {countries.find(c => c.id === parseInt(formData.countryId))?.name || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Box Color</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: boxColors.find(c => c.value === formData.boxColor)?.color || formData.boxColor,
                                  borderRadius: 0.5,
                                  border: '1px solid',
                                  borderColor: 'grey.300'
                                }}
                              />
                              <Typography variant="body1">
                                {boxColors.find(c => c.value === formData.boxColor)?.label || 'Custom'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar with Cost Summary and Navigation */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* Cost Summary */}
                <Card elevation={2} sx={{ position: 'sticky', top: 20 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      💰 Cost Summary
                    </Typography>
                    
                    {formData.weight && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Weight Tier:
                        </Typography>
                        <Chip 
                          label={weightTiers.find(t => t.value === formData.weight)?.label || 'Unknown'}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {formData.countryId && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Destination:
                        </Typography>
                        <Typography variant="body1">
                          {countries.find(c => c.id === parseInt(formData.countryId))?.name}
                        </Typography>
                      </Box>
                    )}

                    {cost !== null ? (
                      <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                          {cost.toFixed(2)} Kr
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Includes 200 Kr base fee + shipping multiplier
                        </Typography>
                      </Paper>
                    ) : (
                      <Paper sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                          Select weight tier and destination to see pricing
                        </Typography>
                      </Paper>
                    )}
                  </CardContent>
                </Card>

                {/* Weight Tier Information */}
                <Card elevation={1}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📋 Weight Tiers Info
                    </Typography>
                    <Stack spacing={2}>
                      {weightTiers.map((tier) => (
                        <Box key={tier.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{tier.icon}</Typography>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {tier.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {tier.description}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              variant="outlined"
              size="large"
              sx={{ minWidth: 120 }}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !cost}
                startIcon={<Send />}
                sx={{ 
                  minWidth: 180,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Creating Shipment...' : 'Create Shipment'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateShipment;
