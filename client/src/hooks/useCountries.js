import { useState, useEffect, useRef } from 'react';

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchCountries = async () => {
      // Prevent duplicate calls
      if (hasFetched.current || loading || loaded || countries.length > 0) {
        return;
      }

      hasFetched.current = true;
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:3001/api/countries?active=true');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setCountries(data);
        setLoaded(true);
      } catch (err) {
        console.error('Error fetching countries:', err.message);
        setError(err.message);
        hasFetched.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once - dependencies handled manually to prevent loops

  return { countries, loading, error, loaded };
};
