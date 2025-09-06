import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Profile page is under development.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;
