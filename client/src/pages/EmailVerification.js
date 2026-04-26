import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  ArrowBack
} from '@mui/icons-material';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendDialog, setResendDialog] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // If token is provided, verify it
    if (token) {
      verifyEmail();
    } else {
      // If no token, just show the page to allow manual verification
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:3001/api/auth/verify-email/${token}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify email');
      }

      const data = await response.json();
      setVerified(true);
      showSuccess(data.message || 'Email verified successfully!');

      // Redirect to login or dashboard after 3 seconds
      setTimeout(() => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }, 3000);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!resendEmail) {
      showError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resendEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend verification email');
      }

      showSuccess('Verification email sent successfully! Check your inbox.');
      setResendDialog(false);
      setResendEmail('');
    } catch (err) {
      showError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (loading && token) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying your email...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your email address
          </Typography>
        </Box>
      </Container>
    );
  }

  if (verified) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom align="center">
            Email Verified Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Your email has been verified. You'll be redirected shortly...
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            Go to {user ? 'Dashboard' : 'Login'}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="text"
        >
          Back
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Error State */}
        {error && token && (
          <Box>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom align="center">
                Verification Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {error}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                What can you do?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The verification link may have expired. You can request a new verification email below.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{ mb: 2 }}
                onClick={() => setResendDialog(true)}
              >
                Resend Verification Email
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        )}

        {/* Initial State (No Token) */}
        {!token && !error && (
          <Box>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 3 }}>
              <EmailIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom align="center">
                Verify Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Please check your email for a verification link
              </Typography>
            </Box>

            <Card sx={{ bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light', mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  📧 How it works:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>
                    <Typography variant="body2">
                      We've sent a verification link to your email
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click the link in the email to verify your address
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      You'll be automatically logged in after verification
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Didn't receive an email?</strong> Check your spam folder or request a new verification email below.
              </Typography>
            </Alert>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setResendDialog(true)}
                startIcon={<Refresh />}
              >
                Resend Verification Email
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register">
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Resend Email Dialog */}
      <Dialog
        open={resendDialog}
        onClose={() => !resendLoading && setResendDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resend Verification Email</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter your email address to receive a new verification link.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Email Address"
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={resendLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResendDialog(false)}
            disabled={resendLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResendVerificationEmail}
            variant="contained"
            disabled={resendLoading || !resendEmail}
          >
            {resendLoading ? <CircularProgress size={20} /> : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmailVerification;
