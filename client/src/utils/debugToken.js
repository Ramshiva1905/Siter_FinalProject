// Debug utility to check token validity
export const debugToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return null;
  }

  try {
    // Decode JWT payload (without verifying - just for debugging)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    
    console.log('🔍 Token Debug Info:', {
      hasToken: true,
      userId: payload.userId,
      issuedAt: new Date(payload.iat * 1000).toLocaleString(),
      expiresAt: new Date(payload.exp * 1000).toLocaleString(),
      isExpired,
      timeUntilExpiry: isExpired ? 'EXPIRED' : `${Math.floor((payload.exp - now) / 3600)} hours`
    });
    
    return { payload, isExpired };
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

// Call this in browser console to debug: debugToken()
window.debugToken = debugToken;
