import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { useCountries } from '../hooks/useCountries';

const CountriesDropdownTest = () => {
  const { countries, loading, error, loaded } = useCountries();
  const [selectedCountry, setSelectedCountry] = React.useState('');

  const handleChange = (event) => {
    console.log('🎯 Country selected:', event.target.value);
    setSelectedCountry(event.target.value);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const selectedCountryName = countries.find(c => c.id === selectedCountry)?.name || 'None';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Countries Dropdown Test
      </Typography>

      {/* Debug Panel */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>Debug Information:</Typography>
        <Typography variant="body2">
          • Countries Count: {countries.length}<br/>
          • Loading: {loading ? 'Yes' : 'No'}<br/>
          • Loaded: {loaded ? 'Yes' : 'No'}<br/>
          • Error: {error || 'None'}<br/>
          • Selected: {selectedCountryName} (ID: {selectedCountry || 'None'})
        </Typography>
        <Button variant="outlined" onClick={handleRefresh} sx={{ mt: 2 }}>
          Refresh Page
        </Button>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          API Error: {error}
        </Alert>
      )}

      {/* Countries Dropdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select a Country
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="country-select-label">Choose Country</InputLabel>
            <Select
              labelId="country-select-label"
              value={selectedCountry}
              label="Choose Country"
              onChange={handleChange}
              disabled={loading}
            >
              {loading && (
                <MenuItem disabled value="">
                  <em>Loading countries...</em>
                </MenuItem>
              )}
              
              {!loading && countries.length === 0 && (
                <MenuItem disabled value="">
                  <em>No countries available</em>
                </MenuItem>
              )}
              
              {!loading && countries.length > 0 && (
                <MenuItem value="">
                  <em>-- Select a country --</em>
                </MenuItem>
              )}
              
              {!loading && countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name} (Multiplier: {country.multiplier})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Countries List for Verification */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              All Available Countries ({countries.length}):
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', p: 1 }}>
              {countries.map((country, index) => (
                <Typography key={country.id} variant="body2" sx={{ py: 0.5 }}>
                  {index + 1}. {country.name} (ID: {country.id}, Multiplier: {country.multiplier})
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CountriesDropdownTest;
