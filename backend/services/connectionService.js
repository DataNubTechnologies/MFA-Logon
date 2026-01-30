// SAP Connection Service
import { SAP_CONFIG, getBaseUrl, createAuthHeader, storeCredentials } from './config.js';

// Test connection to SAP system
export const testConnection = async (system) => {
  const { url, username, password } = system;
  const baseUrl = getBaseUrl(url);
  
  try {
    const response = await fetch(`${baseUrl}${SAP_CONFIG.METADATA_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'Accept': 'application/xml',
      },
    });

    if (response.ok) {
      storeCredentials(username, password);
      return { success: true, message: 'Connection successful' };
    } else if (response.status === 401) {
      return { success: false, message: 'Authentication failed. Check username and password.' };
    } else {
      return { success: false, message: `Connection failed with status: ${response.status}` };
    }
  } catch (error) {
    console.error('Connection error:', error);
    return { 
      success: false, 
      message: `Network error: ${error.message}` 
    };
  }
};
