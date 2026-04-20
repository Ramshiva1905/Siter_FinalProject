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
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  LocalShipping,
  Person,
  Scale,
  Public,
  Palette,
  Receipt
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useCountries } from '../hooks/useCountries';

const CreateShipment = () => {
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  
  const [formData, setFormData] = useState({
    receiverName: '',
    weight: '',
    boxColor: 'rgba(255, 0, 0, 1)',
    countryId: '',
    guestEmail: ''
  });
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
    const calculateCost = () => {
      const selectedCountry = countries.find(c => c.id === formData.countryId);
      if (selectedCountry && formData.weight) {
        const flatFee = 200;
        const calculatedCost = flatFee + (parseFloat(formData.weight) * selectedCountry.multiplier);
        setCost(calculatedCost);
      }
    };

    if (formData.weight && formData.countryId) {
      calculateCost();
    }
  }, [formData.weight, formData.countryId, countries]);

  const handleChange = (e) => {
    console.log('🔄 Form change:', e.target.name, '=', e.target.value);
    
    if (e.target.name === 'countryId') {
      const selectedCountry = countries.find(c => c.id === e.target.value);
      console.log('🌍 Country selection:', {
        value: e.target.value,
        countryName: selectedCountry?.name || 'Unknown',
        totalCountries: countries.length
      });
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚢 Starting shipment creation...');
    console.log('👤 User status:', { user: !!user, isGuest });
    console.log('📝 Current form data:', formData);
    
    // Validation
    if (!formData.receiverName.trim()) {
      console.log('❌ Validation failed: Receiver name is required');
      setError('Receiver name is required');
      setCurrentStep(0);
      return;
    }

    if (!user && !formData.guestEmail.trim()) {
      console.log('❌ Validation failed: Guest email is required');
      setError('Guest email is required');
      setCurrentStep(0);
      return;
    }

    if (!formData.weight) {
      console.log('❌ Validation failed: Weight not selected');
      setError('Please select a weight tier');
      setCurrentStep(1);
      return;
    }

    if (!formData.countryId) {
      console.log('❌ Validation failed: Country not selected');
      setError('Please select a destination country');
      setCurrentStep(1);
      return;
    }

    // Check if boxColor is in valid RGBA format
    const rgbaPattern = /^rgba?\(\d+,\s*\d+,\s*\d+(,\s*[01]?\.?\d*)?\)$/;
    if (!rgbaPattern.test(formData.boxColor)) {
      console.log('❌ Validation failed: Invalid RGBA color format:', formData.boxColor);
      setError('Invalid box color format');
      return;
    }

    console.log('✅ All frontend validations passed');

    setLoading(true);
    setError('');

    try {
      console.log('🚢 Creating shipment with data:', formData);
      console.log('📊 Form validation check:', {
        receiverName: formData.receiverName.trim() ? '✅' : '❌',
        weight: formData.weight ? '✅' : '❌',
        boxColor: rgbaPattern.test(formData.boxColor) ? '✅' : '❌',
        countryId: formData.countryId ? '✅' : '❌',
        guestEmail: !user ? (formData.guestEmail ? '✅' : '❌') : 'N/A (logged in user)'
      });

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare the data to send - exclude guestEmail if user is logged in
      const submitData = { ...formData };
      if (user) {
        delete submitData.guestEmail;
      }
      
      console.log('📤 Final data being sent to server:', submitData);

      const response = await fetch('http://localhost:3001/api/shipments', {
        method: 'POST',
        headers,
        body: JSON.stringify(submitData)
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server validation error:', errorData);
        
        // Log detailed validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          console.error('🔍 Detailed validation errors:');
          errorData.details.forEach((detail, index) => {
            console.error(`  ${index + 1}. Field: ${detail.path || detail.param}`, detail);
          });
        }
        
        throw new Error(errorData.error || 'Failed to create shipment');
      }
      
      const data = await response.json();
      console.log('Shipment created:', data);
      
      // Navigate based on user type with appropriate messages
      if (user) {
        showSuccess('Shipment created successfully! Redirecting to your dashboard...');
        // Logged-in users go to dashboard
        navigate('/dashboard');
      } else {
        showSuccess('Shipment created successfully! You can track your shipment using the tracking ID provided in your email.');
        // Guests go back to homepage
        navigate('/');
      }
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

      {countriesError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Countries API Error: {countriesError}
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
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          label="Receiver Name"
                          name="receiverName"
                          value={formData.receiverName}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      
                      {(!user || isGuest) && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            required
                            type="email"
                            label="Your Email Address"
                            name="guestEmail"
                            value={formData.guestEmail}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                            helperText="We'll send tracking information to this email"
                          />
                        </Grid>
                      )}
                    </Grid>
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
                          label="Select Destination"
                          onChange={handleChange}
                          disabled={loading || countriesLoading}
                          sx={{ 
                            borderRadius: 2,
                            cursor: 'pointer',
                            '& .MuiSelect-select': {
                              cursor: 'pointer'
                            },
                            '& .MuiSelect-icon': {
                              cursor: 'pointer'
                            }
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                            disableAutoFocusItem: true,
                          }}
                        >
                          {countriesLoading && (
                            <MenuItem disabled value="">
                              <em>Loading countries...</em>
                            </MenuItem>
                          )}
                          {!countriesLoading && countries.length === 0 && (
                            <MenuItem disabled value="">
                              <em>No countries available</em>
                            </MenuItem>
                          )}
                          {!countriesLoading && countries.length > 0 && (
                            <MenuItem value="">
                              <em>-- Select a destination country --</em>
                            </MenuItem>
                          )}
                          {!countriesLoading && countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                        
                        {/* Selected Country Display */}
                        {formData.countryId && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            bgcolor: 'success.light', 
                            borderRadius: 1,
                            border: '2px solid',
                            borderColor: 'success.main'
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>
                              ✅ Selected Country: {countries.find(c => c.id === formData.countryId)?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'success.contrastText' }}>
                              ID: {formData.countryId} | Multiplier: {countries.find(c => c.id === formData.countryId)?.multiplier || 'N/A'}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => setFormData({...formData, countryId: ''})}
                                sx={{ 
                                  color: 'success.contrastText', 
                                  borderColor: 'success.contrastText',
                                  '&:hover': { bgcolor: 'success.dark' }
                                }}
                              >
                                Clear Selection
                              </Button>
                            </Box>
                          </Box>
                        )}
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
                                height: 60,
                                backgroundColor: color.color,
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: formData.boxColor === color.value ? '3px solid #000' : '2px solid transparent',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: 2
                                }
                              }}
                              onClick={() => setFormData({...formData, boxColor: color.value})}
                              title={color.label}
                            >
                              {formData.boxColor === color.value && (
                                <Box sx={{ 
                                  color: color.color === '#ffff00' ? '#000' : '#fff',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem'
                                }}>
                                  ✓
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Selected: {boxColors.find(c => c.value === formData.boxColor)?.label || 'None'}
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
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Recipient Details
                        </Typography>
                        <Typography variant="body2">Name: {formData.receiverName}</Typography>
                        {formData.guestEmail && (
                          <Typography variant="body2">Email: {formData.guestEmail}</Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Package Details
                        </Typography>
                        <Typography variant="body2">
                          Weight: {weightTiers.find(w => w.value === formData.weight)?.label || 'Not selected'}
                        </Typography>
                        <Typography variant="body2">
                          Destination: {countries.find(c => c.id === formData.countryId)?.name || 'Not selected'}
                        </Typography>
                        <Typography variant="body2">
                          Box Color: {boxColors.find(c => c.value === formData.boxColor)?.label || 'Not selected'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {cost && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Total Cost: {cost} Kr
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  variant="outlined"
                  size="large"
                >
                  Back
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    size="large"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    size="large"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Shipment'}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateShipment;
