import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalShipping,
  AdminPanelSettings,
  Person,
  PersonOutline,
  Security,
  Email,
  Palette,
  Public,
  Assessment,
  Speed,
  CheckCircle,
  Star,
  ArrowForward,
  Phone,
  LocationOn,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Shipping',
      description: 'AI-powered shipping with dynamic pricing based on destination and package size',
      details: ['Real-time cost calculation', 'Multiple weight tiers', 'Country-specific multipliers']
    },
    {
      icon: <Palette sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Customizable Packages',
      description: 'Choose your box color and personalize your shipping experience',
      details: ['8 color options', 'Visual color picker', 'Custom branding']
    },
    {
      icon: <Assessment sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Real-time Tracking',
      description: 'Track your packages from creation to delivery with detailed status updates',
      details: ['Live status updates', 'Email notifications', 'Delivery confirmation']
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with JWT authentication and 2FA support',
      details: ['Two-factor authentication', 'Encrypted data', 'Secure payments']
    }
  ];

  const userTypes = [
    {
      type: 'Guest Users',
      icon: <PersonOutline sx={{ fontSize: 48, color: 'info.main' }} />,
      color: 'info',
      features: [
        'Quick shipment creation',
        'No registration required',
        'Email tracking updates',
        'Easy account claiming'
      ],
      cta: 'Ship Now',
      ctaAction: () => navigate('/create-shipment'),
      description: 'Start shipping immediately without creating an account'
    },
    {
      type: 'Registered Users',
      icon: <Person sx={{ fontSize: 48, color: 'primary.main' }} />,
      color: 'primary',
      features: [
        'Full shipment history',
        'Account dashboard',
        'Profile management',
        'Email verification'
      ],
      cta: 'Register',
      ctaAction: () => navigate('/register'),
      description: 'Full access to all features with personal account'
    },
    {
      type: 'Administrators',
      icon: <AdminPanelSettings sx={{ fontSize: 48, color: 'error.main' }} />,
      color: 'error',
      features: [
        'User management',
        'Shipment oversight',
        'Country multipliers',
        'System analytics'
      ],
      cta: 'Admin Panel',
      ctaAction: () => navigate('/admin'),
      description: 'Complete system control and management capabilities'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Shipments Delivered', icon: <LocalShipping /> },
    { value: '50+', label: 'Countries Served', icon: <Public /> },
    { value: '99.9%', label: 'Uptime Guarantee', icon: <Speed /> },
    { value: '24/7', label: 'Customer Support', icon: <Phone /> }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: 'SJ',
      rating: 5,
      comment: 'Boxinator has revolutionized how I ship products to my international customers. The pricing is transparent and the tracking is excellent!'
    },
    {
      name: 'Mike Chen',
      role: 'E-commerce Manager',
      avatar: 'MC', 
      rating: 5,
      comment: 'The admin panel gives us complete control over our shipping operations. The country-based pricing is exactly what we needed.'
    },
    {
      name: 'Emma Davis',
      role: 'Individual User',
      avatar: 'ED',
      rating: 5,
      comment: 'I love how I can start shipping as a guest and then create an account later. The color customization is a nice touch!'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Welcome to Boxinator
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                The intelligent shipping platform that adapts to your needs
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem', opacity: 0.8 }}>
                Whether you're a guest user shipping your first package or an enterprise managing thousands of shipments, 
                Boxinator provides the tools and flexibility you need.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ 
                        bgcolor: 'white', 
                        color: 'primary.main',
                        '&:hover': { bgcolor: alpha('#fff', 0.9) }
                      }}
                      startIcon={<LocalShipping />}
                      onClick={() => navigate('/create-shipment')}
                    >
                      Ship Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ 
                        borderColor: 'white', 
                        color: 'white',
                        '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) }
                      }}
                      onClick={() => navigate('/register')}
                    >
                      Create Account
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha('#fff', 0.9) }
                    }}
                    startIcon={<ArrowForward />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400
                }}
              >
                <LocalShipping sx={{ fontSize: 200, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
                elevation={2}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
            Why Choose Boxinator?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Powerful features designed for modern shipping needs
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      {feature.icon}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                    <List dense>
                      {feature.details.map((detail, idx) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText primary={detail} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* User Types Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
          Built for Everyone
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Different users, different needs, one powerful platform
        </Typography>
        
        <Grid container spacing={4}>
          {userTypes.map((userType, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  border: `2px solid transparent`,
                  '&:hover': { 
                    borderColor: `${userType.color}.main`,
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {userType.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {userType.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {userType.description}
                  </Typography>
                  <List>
                    {userType.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ justifyContent: 'center', px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircle sx={{ fontSize: 16, color: `${userType.color}.main` }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    color={userType.color}
                    onClick={userType.ctaAction}
                    size="large"
                  >
                    {userType.cta}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5), py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" fontWeight="bold" gutterBottom>
            What Our Users Say
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Real feedback from real users
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Start Shipping?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers who trust Boxinator for their shipping needs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#fff', 0.9) }
              }}
              startIcon={<LocalShipping />}
              onClick={() => navigate('/create-shipment')}
            >
              Start Shipping
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) }
              }}
              startIcon={<Person />}
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Boxinator
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                The intelligent shipping platform that grows with your business.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="Secure" size="small" />
                <Chip label="Fast" size="small" />
                <Chip label="Reliable" size="small" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Features
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Real-time Tracking" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Dynamic Pricing" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Multi-user Support" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Contact
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Email sx={{ color: 'white', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="support@boxinator.com" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Phone sx={{ color: 'white', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="+1 123-4567" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AccessTime sx={{ color: 'white', fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="24/7 Support" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'grey.700' }} />
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.6 }}>
            © 2025 Boxinator. All rights reserved. Built with ❤️ for modern shipping.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
