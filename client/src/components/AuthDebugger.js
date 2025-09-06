import React from 'react';
import { Button, Box, Typography } from '@mui/material';

const AuthDebugger = () => {
  const clearAllAuth = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    delete window.axios?.defaults?.headers?.common?.Authorization;
    console.log('🧹 All authentication data cleared');
    window.location.reload();
  };

  const showTokenInfo = () => {
    if (window.debugToken) {
      window.debugToken();
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, m: 2 }}>
      <Typography variant="h6" gutterBottom>Auth Debugger</Typography>
      <Button 
        variant="outlined" 
        onClick={showTokenInfo} 
        sx={{ mr: 1 }}
      >
        Check Token
      </Button>
      <Button 
        variant="contained" 
        color="warning"
        onClick={clearAllAuth}
      >
        Clear All Auth Data
      </Button>
    </Box>
  );
};

export default AuthDebugger;
