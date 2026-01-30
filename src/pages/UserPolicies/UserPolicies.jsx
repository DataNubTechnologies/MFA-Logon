import { useState, useEffect, useMemo } from 'react';
import { FiRefreshCw, FiAlertCircle, FiUsers, FiPlus, FiX, FiEdit2, FiTrash2, FiMail, FiMessageSquare, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });
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

  // Search, filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComm, setFilterComm] = useState('all'); // 'all', 'M', 'S'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (policy.UserLg || '').toLowerCase().includes(searchLower) ||
        (policy.UserIp || '').toLowerCase().includes(searchLower) ||
        (policy.Terminal || '').toLowerCase().includes(searchLower);
      
      // Communication filter
      const matchesComm = filterComm === 'all' || policy.OtpComm === filterComm;
      
      return matchesSearch && matchesComm;
    });
  }, [policies, searchTerm, filterComm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterComm]);

  const getConnectionInfo = () => {
    // Try new config format first
    const storedConfig = localStorage.getItem('sapSystemConfig');
    let systems = [];
    
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      systems = config.systems || [];
    } else {
      // Fallback to old format
      const storedSystems = localStorage.getItem('sapSystems');
      if (storedSystems) {
        systems = JSON.parse(storedSystems);
      }
    }
    
    if (systems.length === 0) {
      return { error: 'No SAP system configured. Please configure a system in Settings first.' };
    }

    const connectedSystem = systems.find(sys => sys.status === 'connected');
    
    if (!connectedSystem) {
      return { error: 'No connected SAP system. Please test connection in Settings first.' };
    }

    // Get credentials - use stored in system or from credentials store
    const creds = {
      username: connectedSystem.username,
      password: connectedSystem.password
    };
    
    if (!creds.password) {
      const storedCreds = localStorage.getItem('sapCredentials');
      if (storedCreds) {
        const parsedCreds = JSON.parse(storedCreds);
        creds.password = parsedCreds.password;
      }
    }

    if (!creds.username || !creds.password) {
      return { error: 'Missing credentials. Please test connection in Settings first.' };
    }

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
          setIsSubmitting(false);
          closeAddDialog();
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Failed to create policy' });
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
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
          setIsSubmitting(false);
          closeEditDialog();
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Failed to update policy' });
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (userLg) => {
    setDeleteTarget(userLg);
    setDeleteMessage({ type: '', text: '' });
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
    setDeleteMessage({ type: '', text: '' });
  };

  const handleDeletePolicy = async () => {
    if (!deleteTarget) return;

    const connInfo = getConnectionInfo();
    if (connInfo.error) {
      setDeleteMessage({ type: 'error', text: connInfo.error });
      return;
    }

    const { connectedSystem, creds } = connInfo;
    
    setIsDeleting(deleteTarget);

    try {
      const result = await deleteMFAUserPolicy(
        connectedSystem.url,
        creds.username,
        creds.password,
        deleteTarget
      );

      if (result.success) {
        setDeleteMessage({ type: 'success', text: 'Policy deleted successfully!' });
        await loadPolicies();
        setTimeout(() => {
          setIsDeleting(null);
          closeDeleteDialog();
        }, 1000);
      } else {
        setDeleteMessage({ type: 'error', text: result.error || 'Failed to delete policy' });
        setIsDeleting(null);
      }
    } catch (err) {
      setDeleteMessage({ type: 'error', text: err.message });
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
        <>
          {/* Search and Filters */}
          <div className="user-policies-toolbar">
            <div className="search-box">
              <FiSearch size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by user, IP, or terminal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <FiX size={16} />
                </button>
              )}
            </div>
            
            <div className="filter-group">
              <FiFilter size={16} className="filter-icon" />
              <select 
                className="filter-select"
                value={filterComm}
                onChange={(e) => setFilterComm(e.target.value)}
              >
                <option value="all">All Communication</option>
                <option value="M">Mail Only</option>
                <option value="S">SMS Only</option>
              </select>
            </div>

            <div className="results-info">
              Showing {filteredPolicies.length} of {policies.length} policies
            </div>
          </div>

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
                {paginatedPolicies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-results">
                      No policies match your search criteria
                    </td>
                  </tr>
                ) : (
                  paginatedPolicies.map((policy, index) => (
                    <tr key={policy.UserLg || index}>
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
                            onClick={() => openDeleteDialog(policy.UserLg)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredPolicies.length} items)
              </div>
              
              <div className="pagination-controls">
                <select 
                  className="page-size-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  ««
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <FiChevronLeft size={18} />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <FiChevronRight size={18} />
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </>
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

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && deleteTarget && (
        <div className="policy-dialog-backdrop" onClick={closeDeleteDialog}>
          <div className="policy-dialog delete-dialog" onClick={e => e.stopPropagation()}>
            <div className="policy-dialog-header">
              <h4 className="policy-dialog-title">Delete User Policy</h4>
              <button className="btn-icon" onClick={closeDeleteDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="policy-dialog-body">
              {deleteMessage.text && (
                <div className={`policy-dialog-message ${deleteMessage.type}`}>
                  {deleteMessage.text}
                </div>
              )}
              
              <div className="delete-dialog-content">
                <div className="delete-icon-wrapper">
                  <FiTrash2 size={32} />
                </div>
                <p className="delete-dialog-text">
                  Are you sure you want to delete the policy for user <strong>{deleteTarget}</strong>?
                </p>
                <p className="delete-dialog-warning">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="policy-dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeletePolicy}
                disabled={isDeleting === deleteTarget}
              >
                {isDeleting === deleteTarget ? 'Deleting...' : 'Delete Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPolicies;
