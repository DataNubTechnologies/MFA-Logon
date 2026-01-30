// MFA User Policy Service - CRUD Operations
import { SAP_CONFIG, getBaseUrl, createAuthHeader } from './config.js';
import { fetchCSRFToken, clearCSRFToken } from './csrfService.js';

// GET - Fetch all MFA User Policies
export const fetchMFAUserPolicies = async (storedUrl, username, password) => {
  const baseUrl = getBaseUrl(storedUrl);
  
  try {
    const response = await fetch(`${baseUrl}${SAP_CONFIG.ODATA_SERVICE}/MFAUserPolicySet?$format=json`, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.d?.results || data.value || [],
    };
  } catch (error) {
    console.error('Error fetching MFA policies:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

// POST - Create a new MFA User Policy using $batch
export const createMFAUserPolicy = async (storedUrl, username, password, policyData) => {
  const baseUrl = getBaseUrl(storedUrl);
  
  try {
    // First, fetch CSRF token
    const tokenResult = await fetchCSRFToken(storedUrl, username, password);
    if (!tokenResult.success) {
      return { success: false, error: `Failed to get CSRF token: ${tokenResult.error}` };
    }

    const csrfToken = tokenResult.token;
    
    // Create batch boundary identifiers
    const batchBoundary = `batch_${Date.now()}`;
    const changesetBoundary = `changeset_${Date.now()}`;

    // Build the batch request body
    const batchBody = buildBatchBody(batchBoundary, changesetBoundary, policyData);

    // Send the batch request
    const response = await fetch(`${baseUrl}${SAP_CONFIG.BATCH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'X-CSRF-Token': csrfToken,
        'Content-Type': `multipart/mixed; boundary=${batchBoundary}`,
        'Accept': 'multipart/mixed',
      },
      body: batchBody,
    });

    if (response.ok) {
      const responseText = await response.text();
      // Check if the batch response contains success
      if (responseText.includes('HTTP/1.1 201') || responseText.includes('HTTP/1.1 200')) {
        return { success: true, message: 'Policy created successfully' };
      } else if (responseText.includes('HTTP/1.1 4') || responseText.includes('HTTP/1.1 5')) {
        // Extract error message from response
        const errorMatch = responseText.match(/"message"\s*:\s*"([^"]+)"/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Unknown error in batch response';
        return { success: false, error: errorMsg };
      }
      return { success: true, message: 'Policy created successfully' };
    } else if (response.status === 403) {
      // CSRF token might be invalid, clear it and retry
      clearCSRFToken();
      return { success: false, error: 'CSRF token expired. Please try again.' };
    } else {
      const errorText = await response.text();
      return { success: false, error: `Request failed: ${response.status} - ${errorText}` };
    }
  } catch (error) {
    console.error('Error creating MFA policy:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to build batch request body
const buildBatchBody = (batchBoundary, changesetBoundary, policyData) => {
  const lines = [
    `--${batchBoundary}`,
    `Content-Type: multipart/mixed; boundary=${changesetBoundary}`,
    '',
    `--${changesetBoundary}`,
    'Content-Type: application/http',
    'Content-Transfer-Encoding: binary',
    'Content-ID: 1',
    '',
    'POST MFAUserPolicySet HTTP/1.1',
    'Content-Type: application/json',
    'Accept: application/json',
    '',
    JSON.stringify({
      UserLg: policyData.userLg,
      UserIp: policyData.userIp,
      Terminal: policyData.terminal,
      OtpComm: policyData.otpComm,
    }),
    '',
    `--${changesetBoundary}--`,
    `--${batchBoundary}--`,
  ];
  
  return lines.join('\r\n');
};

// UPDATE - Update an existing MFA User Policy using $batch
export const updateMFAUserPolicy = async (storedUrl, username, password, policyData) => {
  const baseUrl = getBaseUrl(storedUrl);
  
  try {
    const tokenResult = await fetchCSRFToken(storedUrl, username, password);
    if (!tokenResult.success) {
      return { success: false, error: `Failed to get CSRF token: ${tokenResult.error}` };
    }

    const csrfToken = tokenResult.token;

    // Build PUT request in batch with simple boundary names
    const batchBody = buildUpdateBatchBody(policyData);

    const response = await fetch(`${baseUrl}${SAP_CONFIG.BATCH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'multipart/mixed; boundary=batch',
        'Accept': 'multipart/mixed',
      },
      body: batchBody,
    });

    if (response.ok) {
      const responseText = await response.text();
      // Check if the batch response contains success
      if (responseText.includes('HTTP/1.1 204') || responseText.includes('HTTP/1.1 200')) {
        return { success: true, message: 'Policy updated successfully' };
      } else if (responseText.includes('HTTP/1.1 4') || responseText.includes('HTTP/1.1 5')) {
        const errorMatch = responseText.match(/"message"\s*:\s*"([^"]+)"/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Unknown error in batch response';
        return { success: false, error: errorMsg };
      }
      return { success: true, message: 'Policy updated successfully' };
    } else if (response.status === 403) {
      clearCSRFToken();
      return { success: false, error: 'CSRF token expired. Please try again.' };
    } else {
      return { success: false, error: `Update failed: ${response.status}` };
    }
  } catch (error) {
    console.error('Error updating MFA policy:', error);
    return { success: false, error: error.message };
  }
};

// Helper for update batch body - using simple boundary names as per SAP format
const buildUpdateBatchBody = (policyData) => {
  // Use simple boundary names matching the SAP expected format
  const lines = [
    '--batch',
    'Content-Type: multipart/mixed; boundary=changeset',
    '',
    '--changeset',
    'Content-Type: application/http',
    'Content-Transfer-Encoding: binary',
    '',
    `PUT MFAUserPolicySet('${policyData.userLg}') HTTP/1.1`,
    'Content-Type: application/json',
    'Accept: application/json',
    '',
    JSON.stringify({
      OtpComm: policyData.otpComm,
      Terminal: policyData.terminal,
      UserIp: policyData.userIp,
    }),
    '',
    '--changeset--',
    '--batch--',
  ];
  
  return lines.join('\r\n');
};

// DELETE - Delete an MFA User Policy (direct DELETE request)
export const deleteMFAUserPolicy = async (storedUrl, username, password, userLg) => {
  const baseUrl = getBaseUrl(storedUrl);
  
  try {
    const tokenResult = await fetchCSRFToken(storedUrl, username, password);
    if (!tokenResult.success) {
      return { success: false, error: `Failed to get CSRF token: ${tokenResult.error}` };
    }

    const csrfToken = tokenResult.token;
    
    // Direct DELETE request to the entity
    const response = await fetch(`${baseUrl}${SAP_CONFIG.ODATA_SERVICE}/MFAUserPolicySet('${userLg}')`, {
      method: 'DELETE',
      headers: {
        'Authorization': createAuthHeader(username, password),
        'X-CSRF-Token': csrfToken,
        'Accept': 'application/json',
      },
    });

    if (response.ok || response.status === 204) {
      return { success: true, message: 'Policy deleted successfully' };
    } else if (response.status === 403) {
      clearCSRFToken();
      return { success: false, error: 'CSRF token expired. Please try again.' };
    } else {
      const errorText = await response.text();
      return { success: false, error: `Delete failed: ${response.status} - ${errorText}` };
    }
  } catch (error) {
    console.error('Error deleting MFA policy:', error);
    return { success: false, error: error.message };
  }
};
