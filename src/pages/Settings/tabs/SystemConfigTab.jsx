import { useState, useEffect } from 'react';
import { FiServer, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { testConnection } from '@services/connectionService';
import { storeSAPSystems, storeCredentials } from '@services/config';
import './SystemConfigTab.css';

const SystemConfigTab = () => {
  const [systems, setSystems] = useState(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem('sapSystemConfig');
    if (stored) {
      const config = JSON.parse(stored);
      return config.systems || [];
    }
    return [
      {
        id: 'S18',
        name: 'S18',
        url: 'https://cloud9.way2erp.us:44300',
        clients: '400',
        defaultClient: '400',
        username: 'D10045',
        password: '',
        status: 'not-connected',
        lastTested: null
      }
    ];
  });

  const [testingSystem, setTestingSystem] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState({ systemId: null, type: '', message: '' });
  
  // Password dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordDialogSystem, setPasswordDialogSystem] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    url: '',
    clients: '',
    defaultClient: '',
    username: '',
    password: ''
  });

  const openAddDialog = () => {
    setEditingSystem(null);
    setFormData({
      id: '',
      name: '',
      url: '',
      clients: '',
      defaultClient: '',
      username: '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (system) => {
    setEditingSystem(system);
    setFormData({
      id: system.id,
      name: system.name,
      url: system.url,
      clients: system.clients,
      defaultClient: system.defaultClient,
      username: system.username,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSystem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSystem) {
      setSystems(prev => prev.map(sys => 
        sys.id === editingSystem.id 
          ? { ...sys, ...formData, status: 'connected', lastTested: new Date().toLocaleString() }
          : sys
      ));
    } else {
      const newSystem = {
        ...formData,
        status: 'not-connected',
        lastTested: null
      };
      setSystems(prev => [...prev, newSystem]);
    }
    
    closeDialog();
  };

  // Save full config to localStorage as JSON whenever systems change
  useEffect(() => {
    const config = {
      systems: systems,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('sapSystemConfig', JSON.stringify(config));
    // Also store in old format for backward compatibility
    storeSAPSystems(systems);
  }, [systems]);

  const handleDelete = (systemId) => {
    if (window.confirm('Are you sure you want to delete this system?')) {
      setSystems(prev => prev.filter(sys => sys.id !== systemId));
    }
  };

  const handleTestConnection = async (system) => {
    // Check if we have password - if not, show password dialog
    if (!system.password) {
      setPasswordDialogSystem(system);
      setPasswordInput('');
      setIsPasswordDialogOpen(true);
      return;
    }

    await executeTestConnection(system);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput || !passwordDialogSystem) return;
    
    const systemWithPassword = { ...passwordDialogSystem, password: passwordInput };
    setIsPasswordDialogOpen(false);
    setPasswordInput('');
    
    await executeTestConnection(systemWithPassword);
  };

  const executeTestConnection = async (system) => {
    setTestingSystem(system.id);
    setConnectionMessage({ systemId: null, type: '', message: '' });

    try {
      const result = await testConnection(system);
      
      if (result.success) {
        // Store credentials for API calls
        storeCredentials(system.username, system.password);
        
        // Update system with password and connected status
        setSystems(prev => prev.map(sys => 
          sys.id === system.id 
            ? { ...sys, password: system.password, status: 'connected', lastTested: new Date().toLocaleString() }
            : sys
        ));
        setConnectionMessage({ 
          systemId: system.id, 
          type: 'success', 
          message: 'Connected successfully!' 
        });
      } else {
        setSystems(prev => prev.map(sys => 
          sys.id === system.id 
            ? { ...sys, status: 'not-connected' }
            : sys
        ));
        setConnectionMessage({ 
          systemId: system.id, 
          type: 'error', 
          message: result.message 
        });
      }
    } catch (error) {
      setConnectionMessage({ 
        systemId: system.id, 
        type: 'error', 
        message: error.message 
      });
    } finally {
      setTestingSystem(null);
      setPasswordDialogSystem(null);
      // Clear message after 5 seconds
      setTimeout(() => setConnectionMessage({ systemId: null, type: '', message: '' }), 5000);
    }
  };

  return (
    <div className="system-config-tab">
      <div className="system-config-header">
        <div>
          <h3>System Configuration</h3>
          <p className="system-config-subtitle">Configure SAP systems</p>
        </div>
        <button className="btn btn-primary" onClick={openAddDialog}>
          <FiPlus size={16} />
          ADD SAP SYSTEM
        </button>
      </div>

      {systems.length === 0 ? (
        <div className="system-config-empty">
          <FiServer size={48} />
          <p>No SAP systems configured</p>
          <p>Click "Add SAP System" to get started</p>
        </div>
      ) : (
        <div className="system-config-cards">
          {systems.map((system) => (
            <div 
              key={system.id} 
              className={`system-config-card ${system.status === 'connected' ? 'active' : ''}`}
            >
              <div className="system-config-card-icon">
                <FiServer size={24} />
              </div>
              
              <div className="system-config-card-content">
                <div className="system-config-card-header">
                  <div className="system-config-card-title-row">
                    <h4 className="system-config-card-title">{system.name}</h4>
                    <span className="system-config-chip">{system.id}</span>
                  </div>
                  <div className={`system-config-badge ${system.status === 'connected' ? 'success' : 'error'}`}>
                    {system.status === 'connected' ? <FiCheck size={14} /> : <FiX size={14} />}
                    {system.status === 'connected' ? 'Connected' : 'Not connected'}
                  </div>
                </div>
                
                <a href={system.url} className="system-config-card-url" target="_blank" rel="noopener noreferrer">
                  {system.url}
                </a>
                
                <div className="system-config-card-info">
                  <div className="system-config-card-info-item">
                    <span className="system-config-card-label">Clients:</span>
                    <span className="system-config-card-value">{system.clients}</span>
                  </div>
                  <div className="system-config-card-info-item">
                    <span className="system-config-card-label">Default:</span>
                    <span className="system-config-card-value">{system.defaultClient}</span>
                  </div>
                  <div className="system-config-card-info-item">
                    <span className="system-config-card-label">User:</span>
                    <span className="system-config-card-value">{system.username}</span>
                  </div>
                </div>
                
                {system.lastTested && (
                  <p className="system-config-card-timestamp">
                    Last tested: {system.lastTested}
                  </p>
                )}

                {connectionMessage.systemId === system.id && (
                  <p className={`system-config-card-message ${connectionMessage.type}`}>
                    {connectionMessage.message}
                  </p>
                )}
              </div>

              <div className="system-config-card-actions">
                <button 
                  className={`test-connection-btn ${testingSystem === system.id ? 'loading' : ''}`}
                  onClick={() => handleTestConnection(system)}
                  disabled={testingSystem === system.id}
                >
                  {testingSystem === system.id ? (
                    <>
                      <FiLoader className="spin" size={14} />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => openEditDialog(system)}
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDelete(system.id)}
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="system-config-dialog-backdrop" onClick={closeDialog}>
          <div className="system-config-dialog" onClick={e => e.stopPropagation()}>
            <div className="system-config-dialog-header">
              <h4 className="system-config-dialog-title">
                {editingSystem ? 'Edit SAP System' : 'Add SAP System'}
              </h4>
              <button className="btn-icon" onClick={closeDialog}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="system-config-dialog-body">
                <div className="system-config-dialog-form-grid">
                  <div className="form-group">
                    <label className="form-label">System ID *</label>
                    <input
                      type="text"
                      name="id"
                      className="form-input"
                      value={formData.id}
                      onChange={handleInputChange}
                      placeholder="e.g., S18"
                      required
                      disabled={!!editingSystem}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Production System"
                    />
                  </div>
                  
                  <div className="form-group span-2">
                    <label className="form-label">Base URL *</label>
                    <input
                      type="url"
                      name="url"
                      className="form-input"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com:44300"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Clients *</label>
                    <input
                      type="text"
                      name="clients"
                      className="form-input"
                      value={formData.clients}
                      onChange={handleInputChange}
                      placeholder="e.g., 100, 200, 300"
                      required
                    />
                    <span className="field-hint">Comma-separated client numbers</span>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Default Client</label>
                    <input
                      type="text"
                      name="defaultClient"
                      className="form-input"
                      value={formData.defaultClient}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-input"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Basic Auth username"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Basic Auth password"
                    />
                  </div>
                </div>
              </div>
              
              <div className="system-config-dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={closeDialog}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSystem ? 'Save Changes' : 'Add System'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Dialog */}
      {isPasswordDialogOpen && passwordDialogSystem && (
        <div className="system-config-dialog-backdrop" onClick={() => setIsPasswordDialogOpen(false)}>
          <div className="system-config-dialog password-dialog" onClick={e => e.stopPropagation()}>
            <div className="system-config-dialog-header">
              <h4 className="system-config-dialog-title">Enter Password</h4>
              <button className="btn-icon" onClick={() => setIsPasswordDialogOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="system-config-dialog-body">
                <p className="password-dialog-info">
                  Enter password for user <strong>{passwordDialogSystem.username}</strong> on system <strong>{passwordDialogSystem.name}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    required
                  />
                </div>
              </div>
              
              <div className="system-config-dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!passwordInput}>
                  Test Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfigTab;
