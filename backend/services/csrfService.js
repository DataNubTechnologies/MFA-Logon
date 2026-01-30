// CSRF Token Management for SAP OData
import { SAP_CONFIG, getBaseUrl, createAuthHeader } from './config.js';

let cachedToken = null;
let tokenExpiry = null;

// Fetch CSRF token from SAP
export const fetchCSRFToken = async (baseUrl, username, password) => {
  // Check if we have a cached token that's still valid (tokens typically last 30 minutes)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return { success: true, token: cachedToken };
  }

  const url = getBaseUrl(baseUrl);
  
  try {
    const response = await fetch(`${url}${SAP_CONFIG.ODATA_SERVICE}/`, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'X-CSRF-Token': 'Fetch',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const token = response.headers.get('X-CSRF-Token');
      if (token) {
        cachedToken = token;
        tokenExpiry = Date.now() + (25 * 60 * 1000); // Cache for 25 minutes
        return { success: true, token };
      }
      return { success: false, error: 'No CSRF token in response' };
    }

    return { success: false, error: `Failed to fetch token: ${response.status}` };
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    return { success: false, error: error.message };
  }
};

// Clear cached token (useful when session expires)
export const clearCSRFToken = () => {
  cachedToken = null;
  tokenExpiry = null;
};
