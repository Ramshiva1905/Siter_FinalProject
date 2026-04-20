import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Security,
  PhoneAndroid,
  Check,
  Warning
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const TwoFactorAuth = () => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const steps = [
    'Install Authenticator App',
    'Scan QR Code',
    'Verify Setup'
  ];

  useEffect(() => {
    if (user) {
      setIsEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecret(data.secret);
        setQrCode(data.qrCodeUrl);
        setShowSetup(true);
        setActiveStep(0);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('Failed to setup 2FA');
      showError('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });

      if (response.ok) {
        setIsEnabled(true);
        setShowSetup(false);
        setVerificationCode('');
        showSuccess('2FA has been enabled successfully!');
        
        // Update user context if needed
        if (user) {
          user.twoFactorEnabled = true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsEnabled(false);
        setShowDisable(false);
        showSuccess('2FA has been disabled successfully!');
        
        // Update user context if needed
        if (user) {
          user.twoFactorEnabled = false;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Failed to disable 2FA');
      showError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const authenticatorApps = [
    { name: 'Google Authenticator', platforms: ['iOS', 'Android'] },
    { name: 'Microsoft Authenticator', platforms: ['iOS', 'Android'] },
    { name: 'Authy', platforms: ['iOS', 'Android', 'Desktop'] },
    { name: '1Password', platforms: ['iOS', 'Android', 'Desktop'] }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Security sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Two-Factor Authentication
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add an extra layer of security to your account
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isEnabled ? (
              <>
                <Check sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6" color="success.main">
                    2FA is Enabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your account is protected with two-factor authentication
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Warning sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6" color="warning.main">
                    2FA is Disabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enable 2FA to secure your account with an additional verification step
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          
          <Chip
            label={isEnabled ? 'Enabled' : 'Disabled'}
            color={isEnabled ? 'success' : 'warning'}
            size="large"
          />
        </Box>
      </Paper>

      {/* Actions */}
      <Grid container spacing={3}>
        {!isEnabled && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PhoneAndroid sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Enable 2FA
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Set up two-factor authentication using your mobile device for enhanced security.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSetup2FA}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Setting up...' : 'Setup 2FA'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {isEnabled && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Security sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Disable 2FA
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Remove two-factor authentication from your account. This will make your account less secure.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={() => setShowDisable(true)}
                  sx={{ mt: 2 }}
                >
                  Disable 2FA
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                How 2FA Works
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Two-factor authentication adds an extra layer of security by requiring:
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" paragraph>
                  Your password (something you know)
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  A verification code from your phone (something you have)
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Even if someone gets your password, they won't be able to access your account without your phone.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2FA Setup Dialog */}
      <Dialog
        open={showSetup}
        onClose={() => setShowSetup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 2 }} />
            Setup Two-Factor Authentication
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: Install an Authenticator App
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                First, install an authenticator app on your mobile device:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {authenticatorApps.map((app) => (
                  <Grid item xs={12} sm={6} key={app.name}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {app.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {app.platforms.join(', ')}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                >
                  I've Installed an App
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Scan QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Open your authenticator app and scan this QR code:
              </Typography>
              
              {qrCode && (
                <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white', borderRadius: 1, mb: 3 }}>
                  <QRCodeSVG value={qrCode} size={200} />
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Or enter this code manually: <code>{secret}</code>
              </Typography>
              
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                sx={{ mt: 2 }}
              >
                I've Scanned the Code
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Verify Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter the 6-digit code from your authenticator app:
              </Typography>
              
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setError('');
                }}
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
                autoFocus
              />
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowSetup(false)}>
            Cancel
          </Button>
          {activeStep === 2 && (
            <Button
              onClick={handleVerify2FA}
              variant="contained"
              disabled={loading || !verificationCode}
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Disable 2FA Confirmation Dialog */}
      <Dialog open={showDisable} onClose={() => setShowDisable(false)}>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can re-enable 2FA at any time from your security settings.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisable(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDisable2FA}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TwoFactorAuth;
