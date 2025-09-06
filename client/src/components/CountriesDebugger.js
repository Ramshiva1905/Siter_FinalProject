import React from 'react';
import { useCountries } from '../hooks/useCountries';

const CountriesDebugger = () => {
  const { countries, loading, error } = useCountries();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Countries Debug Panel</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Status</h3>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Countries Count:</strong> {countries.length}</p>
      </div>

      {loading && <p>Loading countries...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {countries.length > 0 && (
        <div>
          <h3>Countries ({countries.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {countries.map((country, index) => (
              <div key={country.id || index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                <strong>{country.name}</strong> (ID: {country.id}, Multiplier: {country.multiplier})
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h4>Test Dropdown</h4>
        <select style={{ width: '100%', padding: '10px' }}>
          <option value="">Select a country...</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CountriesDebugger;
