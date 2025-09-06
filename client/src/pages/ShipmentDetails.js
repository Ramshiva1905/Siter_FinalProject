import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const ShipmentDetails = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Shipment Details
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1">
          Shipment details page is under development.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ShipmentDetails;
