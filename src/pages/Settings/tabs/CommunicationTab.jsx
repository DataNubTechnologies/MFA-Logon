import { useState } from 'react';

const CommunicationTab = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://prod-xx.westus.logic.azure.com/workflows/...');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ 
        type: 'success', 
        text: 'Communication configuration saved successfully.' 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  return (
    <div className="communication-tab">
      <h3>Communication Configuration</h3>
      <p className="settings-subtitle">
        Configure the outbound integration used for notifications and workflow triggers.
      </p>

      <div className="info-callout">
        Paste the Power Automate webhook URL here. This value is treated as a secret and shown as masked.
      </div>

      {message.text && (
        <div className={`${message.type}-message`}>
          {message.text}
        </div>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        <div className="form-row span-2">
          <label className="form-label">
            Power Automate Webhook URL
          </label>
          <div>
            <input
              type="password"
              className="form-input"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://prod-xx.westus.logic.azure.com/workflows/..."
            />
            <p className="field-hint">Stored as a secret (masked input)</p>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'SAVE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunicationTab;
