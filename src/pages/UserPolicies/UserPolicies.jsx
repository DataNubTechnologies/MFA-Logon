import { useState, useEffect } from 'react';
import { FiRefreshCw, FiAlertCircle, FiUsers, FiPlus, FiX, FiEdit2, FiTrash2, FiMail, FiMessageSquare } from 'react-icons/fi';
import { fetchMFAUserPolicies, createMFAUserPolicy, updateMFAUserPolicy, deleteMFAUserPolicy } from '@services/policyService';
import { getStoredCredentials, getConnectedSystem } from '@services/config';
import './UserPolicies.css';

const UserPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    userLg: '',
    userIp: '',
    terminal: '',
    otpComm: 'M',
  });
  const [editFormData, setEditFormData] = useState({
    userLg: '',
    userIp: '',
    terminal: '',
    otpComm: 'M',
  });

  const getConnectionInfo = () => {
    const storedSystems = localStorage.getItem('sapSystems');
    const storedCreds = localStorage.getItem('sapCredentials');
    
    if (!storedSystems || !storedCreds) {
      return { error: 'No SAP system configured. Please configure a system in Settings first.' };
    }

    const systems = JSON.parse(storedSystems);
    const connectedSystem = systems.find(sys => sys.status === 'connected');
    
    if (!connectedSystem) {
      return { error: 'No connected SAP system. Please test connection in Settings first.' };
    }

    const creds = JSON.parse(storedCreds);
    return { connectedSystem, creds };
  };

  const loadPolicies = async () => {
    const connInfo = getConnectionInfo();
    
    if (connInfo.error) {
      setError(connInfo.error);
      return;
    }

    const { connectedSystem, creds } = connInfo;
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchMFAUserPolicies(
        connectedSystem.url, 
        creds.username, 
        creds.password
      );

      if (result.success) {
        setPolicies(result.data);
        setLastFetched(new Date().toLocaleString());
      } else {
        setError(result.error || 'Failed to fetch policies');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setFormData({
      userLg: '',
      userIp: '',
      terminal: '',
      otpComm: 'M',
    });
    setSubmitMessage({ type: '', text: '' });
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setSubmitMessage({ type: '', text: '' });
  };

  const openEditDialog = (policy) => {
    setEditFormData({
      userLg: policy.UserLg || '',
      userIp: policy.UserIp || '',
      terminal: policy.Terminal || '',
      otpComm: policy.OtpComm || 'M',
    });
    setSubmitMessage({ type: '', text: '' });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSubmitMessage({ type: '', text: '' });
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    
    const connInfo = getConnectionInfo();
    if (connInfo.error) {
      setSubmitMessage({ type: 'error', text: connInfo.error });
      return;
    }

    const { connectedSystem, creds } = connInfo;
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const result = await createMFAUserPolicy(
        connectedSystem.url,
        creds.username,
        creds.password,
        formData
      );

      if (result.success) {
        setSubmitMessage({ type: 'success', text: 'Policy created successfully!' });
        await loadPolicies();
        setTimeout(() => {
          closeAddDialog();
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Failed to create policy' });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPolicy = async (e) => {
    e.preventDefault();
    
    const connInfo = getConnectionInfo();
    if (connInfo.error) {
      setSubmitMessage({ type: 'error', text: connInfo.error });
      return;
    }

    const { connectedSystem, creds } = connInfo;
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    try {
      const result = await updateMFAUserPolicy(
        connectedSystem.url,
        creds.username,
        creds.password,
        editFormData
      );

      if (result.success) {
        setSubmitMessage({ type: 'success', text: 'Policy updated successfully!' });
        await loadPolicies();
        setTimeout(() => {
          closeEditDialog();
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Failed to update policy' });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePolicy = async (userLg) => {
    if (!window.confirm(`Are you sure you want to delete policy for user "${userLg}"?`)) {
      return;
    }

    const connInfo = getConnectionInfo();
    if (connInfo.error) {
      setError(connInfo.error);
      return;
    }

    const { connectedSystem, creds } = connInfo;
    
    setIsDeleting(userLg);

    try {
      const result = await deleteMFAUserPolicy(
        connectedSystem.url,
        creds.username,
        creds.password,
        userLg
      );

      if (result.success) {
        await loadPolicies();
      } else {
        setError(result.error || 'Failed to delete policy');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <div className="user-policies-page">
      <div className="user-policies-header">
        <div>
          <h2>User Policies</h2>
          <p className="user-policies-subtitle">
            Manage user MFA policies and access rules.
            {lastFetched && <span className="last-fetched"> Last updated: {lastFetched}</span>}
          </p>
        </div>
        <div className="user-policies-actions">
          <button 
            className="btn btn-primary add-policy-btn" 
            onClick={openAddDialog}
          >
            <FiPlus size={16} />
            Add Policy
          </button>
          <button 
            className="btn btn-secondary refresh-btn" 
            onClick={loadPolicies}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="user-policies-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!error && !loading && policies.length === 0 && (
        <div className="user-policies-empty">
          <FiUsers size={48} />
          <p>No user policies found</p>
          <p>Click "Add Policy" to create a new MFA user policy.</p>
        </div>
      )}

      {policies.length > 0 && (
        <div className="user-policies-table-container">
          <table className="user-policies-table">
            <thead>
              <tr>
                <th>User</th>
                <th>IP Address</th>
                <th>Terminal</th>
                <th>Communication</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy, index) => (
                <tr key={index}>
                  <td>
                    <div className="user-cell">
                      <span className="user-avatar">
                        {(policy.UserLg || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="user-name">{policy.UserLg || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <code className="ip-address">{policy.UserIp || '-'}</code>
                  </td>
                  <td>{policy.Terminal || '-'}</td>
                  <td>
                    <span className={`comm-badge ${policy.OtpComm === 'M' ? 'mail' : policy.OtpComm === 'S' ? 'sms' : 'inactive'}`}>
                      {policy.OtpComm === 'M' ? (
                        <><FiMail size={14} /> Mail</>
                      ) : policy.OtpComm === 'S' ? (
                        <><FiMessageSquare size={14} /> SMS</>
                      ) : (
                        policy.OtpComm || '-'
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button 
                        className="btn-icon edit"
                        onClick={() => openEditDialog(policy)}
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeletePolicy(policy.UserLg)}
                        disabled={isDeleting === policy.UserLg}
                        title="Delete"
                      >
                        {isDeleting === policy.UserLg ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && policies.length === 0 && (
        <div className="user-policies-loading">
          <div className="loading-spinner"></div>
          <p>Loading user policies...</p>
        </div>
      )}

      {/* Add Policy Dialog */}
      {isAddDialogOpen && (
        <div className="policy-dialog-backdrop" onClick={closeAddDialog}>
          <div className="policy-dialog" onClick={e => e.stopPropagation()}>
            <div className="policy-dialog-header">
              <h4 className="policy-dialog-title">Add New User Policy</h4>
              <button className="btn-icon" onClick={closeAddDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddPolicy}>
              <div className="policy-dialog-body">
                {submitMessage.text && (
                  <div className={`policy-dialog-message ${submitMessage.type}`}>
                    {submitMessage.text}
                  </div>
                )}
                
                <div className="policy-form-grid">
                  <div className="form-group">
                    <label className="form-label">User *</label>
                    <input
                      type="text"
                      name="userLg"
                      className="form-input"
                      value={formData.userLg}
                      onChange={handleInputChange}
                      placeholder="e.g., SHANKAR04"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">IP Address *</label>
                    <input
                      type="text"
                      name="userIp"
                      className="form-input"
                      value={formData.userIp}
                      onChange={handleInputChange}
                      placeholder="e.g., 192.168.1.40"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Terminal *</label>
                    <input
                      type="text"
                      name="terminal"
                      className="form-input"
                      value={formData.terminal}
                      onChange={handleInputChange}
                      placeholder="e.g., DESKTOP-04"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Communication *</label>
                    <div className="comm-toggle">
                      <label className={`comm-option ${formData.otpComm === 'M' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="otpComm"
                          value="M"
                          checked={formData.otpComm === 'M'}
                          onChange={handleInputChange}
                        />
                        <FiMail size={18} />
                        <span>Mail</span>
                      </label>
                      <label className={`comm-option ${formData.otpComm === 'S' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="otpComm"
                          value="S"
                          checked={formData.otpComm === 'S'}
                          onChange={handleInputChange}
                        />
                        <FiMessageSquare size={18} />
                        <span>SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="policy-dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={closeAddDialog}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Policy Dialog */}
      {isEditDialogOpen && (
        <div className="policy-dialog-backdrop" onClick={closeEditDialog}>
          <div className="policy-dialog" onClick={e => e.stopPropagation()}>
            <div className="policy-dialog-header">
              <h4 className="policy-dialog-title">Edit User Policy</h4>
              <button className="btn-icon" onClick={closeEditDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditPolicy}>
              <div className="policy-dialog-body">
                {submitMessage.text && (
                  <div className={`policy-dialog-message ${submitMessage.type}`}>
                    {submitMessage.text}
                  </div>
                )}
                
                <div className="policy-form-grid">
                  <div className="form-group">
                    <label className="form-label">User</label>
                    <input
                      type="text"
                      name="userLg"
                      className="form-input disabled"
                      value={editFormData.userLg}
                      disabled
                      readOnly
                    />
                    <span className="field-hint">User ID cannot be changed (it's the key)</span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">IP Address *</label>
                    <input
                      type="text"
                      name="userIp"
                      className="form-input"
                      value={editFormData.userIp}
                      onChange={handleEditInputChange}
                      placeholder="e.g., 192.168.1.40"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Terminal *</label>
                    <input
                      type="text"
                      name="terminal"
                      className="form-input"
                      value={editFormData.terminal}
                      onChange={handleEditInputChange}
                      placeholder="e.g., DESKTOP-04"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Communication *</label>
                    <div className="comm-toggle">
                      <label className={`comm-option ${editFormData.otpComm === 'M' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="otpComm"
                          value="M"
                          checked={editFormData.otpComm === 'M'}
                          onChange={handleEditInputChange}
                        />
                        <FiMail size={18} />
                        <span>Mail</span>
                      </label>
                      <label className={`comm-option ${editFormData.otpComm === 'S' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="otpComm"
                          value="S"
                          checked={editFormData.otpComm === 'S'}
                          onChange={handleEditInputChange}
                        />
                        <FiMessageSquare size={18} />
                        <span>SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="policy-dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditDialog}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPolicies;
