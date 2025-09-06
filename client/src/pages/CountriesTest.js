import React, { useState, useEffect } from 'react';

const CountriesTest = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log('Fetching countries...');
        const response = await fetch('http://localhost:3001/api/countries?active=true');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Countries data:', data);
        console.log('Countries count:', data.length);
        
        if (data.length > 0) {
          console.log('First country:', data[0]);
        }
        
        setCountries(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) return <div>Loading countries...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Countries Test Page</h1>
      <p>Found {countries.length} countries</p>
      
      <h2>Countries List:</h2>
      <ul>
        {countries.map((country, index) => (
          <li key={country.id || index}>
            ID: {country.id}, Name: {country.name}, Multiplier: {country.multiplier}
          </li>
        ))}
      </ul>
      
      <h2>Raw Data:</h2>
      <pre>{JSON.stringify(countries, null, 2)}</pre>
    </div>
  );
};

export default CountriesTest;
