import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const EmailVerification = () => {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Email Verification
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Email verification page is under development.
        </Typography>
      </Paper>
    </Container>
  );
};

export default EmailVerification;
