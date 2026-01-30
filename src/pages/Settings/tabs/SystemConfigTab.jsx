import { useState } from 'react';
import { FiServer, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import './SystemConfigTab.css';

const SystemConfigTab = () => {
  const [systems, setSystems] = useState([
    {
      id: 'S18',
      name: 'S18',
      url: 'https://cloud9.way2erp.us:44300',
      clients: '400',
      defaultClient: '400',
      username: 'D10045',
      password: '********',
      status: 'connected',
      lastTested: '28/1/2026, 9:49:20 am'
    }
  ]);

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

  const handleDelete = (systemId) => {
    if (window.confirm('Are you sure you want to delete this system?')) {
      setSystems(prev => prev.filter(sys => sys.id !== systemId));
    }
  };

  const handleTestConnection = (systemId) => {
    setSystems(prev => prev.map(sys => 
      sys.id === systemId 
        ? { ...sys, status: 'connected', lastTested: new Date().toLocaleString() }
        : sys
    ));
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
              </div>

              <div className="system-config-card-actions">
                <button 
                  className="test-connection-btn"
                  onClick={() => handleTestConnection(system.id)}
                >
                  Test Connection
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
    </div>
  );
};

export default SystemConfigTab;
