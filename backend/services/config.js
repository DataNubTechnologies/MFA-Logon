// SAP OData Service Configuration
export const SAP_CONFIG = {
  ODATA_SERVICE: '/sap/opu/odata/sap/ZDN_COND_MFA_SRV',
  BATCH_ENDPOINT: '/sap/opu/odata/sap/ZDN_COND_MFA_SRV/$batch',
  METADATA_ENDPOINT: '/sap/opu/odata/sap/ZDN_COND_MFA_SRV/$metadata',
};

// Check if we're in development mode (use proxy) or production (direct URL)
// In Vite, import.meta.env.DEV is available during build
export const isDev = import.meta.env?.DEV ?? false;

// Get the base URL - in dev, use proxy; in production, use the stored URL
export const getBaseUrl = (storedUrl) => {
  if (isDev) {
    return '';
  }
  return storedUrl || '';
};

// Create Basic Auth header
export const createAuthHeader = (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
};

// Get stored SAP credentials from localStorage
export const getStoredCredentials = () => {
  const stored = localStorage.getItem('sapCredentials');
  return stored ? JSON.parse(stored) : null;
};

// Store SAP credentials
export const storeCredentials = (username, password) => {
  localStorage.setItem('sapCredentials', JSON.stringify({ username, password }));
};

// Get SAP systems from localStorage (supports both old and new format)
export const getStoredSAPSystems = () => {
  // Try new format first
  const newConfig = localStorage.getItem('sapSystemConfig');
  if (newConfig) {
    const config = JSON.parse(newConfig);
    return config.systems || [];
  }
  // Fallback to old format
  const stored = localStorage.getItem('sapSystems');
  return stored ? JSON.parse(stored) : [];
};

// Store SAP systems
export const storeSAPSystems = (systems) => {
  localStorage.setItem('sapSystems', JSON.stringify(systems));
};

// Get connected SAP system
export const getConnectedSystem = () => {
  const systems = getStoredSAPSystems();
  return systems.find(sys => sys.status === 'connected') || systems[0] || null;
};

// Get full system configuration
export const getSystemConfig = () => {
  const stored = localStorage.getItem('sapSystemConfig');
  if (stored) {
    return JSON.parse(stored);
  }
  return { systems: [], lastUpdated: null };
};
