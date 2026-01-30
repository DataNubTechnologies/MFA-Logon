import { useState } from 'react';
import { FiSettings, FiMail } from 'react-icons/fi';
import SystemConfigTab from './tabs/SystemConfigTab';
import CommunicationTab from './tabs/CommunicationTab';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System Configuration', icon: FiSettings },
    { id: 'communication', label: 'Communication Configuration', icon: FiMail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <SystemConfigTab />;
      case 'communication':
        return <CommunicationTab />;
      default:
        return <SystemConfigTab />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-panel">
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
