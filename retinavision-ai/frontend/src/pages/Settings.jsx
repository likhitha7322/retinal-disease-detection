import React from 'react';
import { Settings as SettingsIcon, Save, Building2, Sliders, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Settings() {
  const { settings, updateSettings, showToast } = useAppContext();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
    showToast('Workstation configuration updated.', 'info');
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    updateSettings({ [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Clinical settings saved successfully.', 'success');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hospital & Specialist Practice Profile */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Building2 size={18} color="var(--primary-teal)" />
                  Hospital &amp; Specialist Practice Profile
                </div>
                <div className="card-subtitle">
                  Information displayed on printed A4 clinical reports and Excel exports
                </div>
              </div>
            </div>

            <div className="form-grid-2col">
              <div>
                <label>Institution / Hospital Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={settings.hospitalName || ''}
                  onChange={handleTextChange}
                />
              </div>

              <div>
                <label>Department / Unit</label>
                <input
                  type="text"
                  name="department"
                  value={settings.department || ''}
                  onChange={handleTextChange}
                />
              </div>

              <div>
                <label>Attending Specialist Name</label>
                <input
                  type="text"
                  name="doctorName"
                  value={settings.doctorName || ''}
                  onChange={handleTextChange}
                />
              </div>

              <div>
                <label>Medical License / Registration No.</label>
                <input
                  type="text"
                  name="doctorRegNo"
                  value={settings.doctorRegNo || ''}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          </div>

          {/* Clinical Workstation Safety & Feature Switches */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Sliders size={18} color="var(--primary-teal)" />
                  Clinical Guardrails &amp; Feature Toggles
                </div>
                <div className="card-subtitle">
                  Configure AI inference workflow requirements &amp; UI safety features
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="toggle-switch-label">
                <div className="toggle-switch-text">
                  <strong>Require quality gate before classification</strong>
                  <span>Disable AI inference execution if physiological quality checks fail</span>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={Boolean(settings.requireQualityGate)}
                  onChange={() => handleToggle('requireQualityGate')}
                />
              </label>

              <label className="toggle-switch-label">
                <div className="toggle-switch-text">
                  <strong>Show Grad-CAM++ Explainability Visualizer</strong>
                  <span>Display gradient attention heatmap overlays on analysis screens</span>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={Boolean(settings.showGradcam)}
                  onChange={() => handleToggle('showGradcam')}
                />
              </label>

              <label className="toggle-switch-label">
                <div className="toggle-switch-text">
                  <strong>Show clinical safety disclaimer banners</strong>
                  <span>Remind users that AI outputs are assistive screening tools requiring clinician review</span>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={Boolean(settings.showSafetyDisclaimer)}
                  onChange={() => handleToggle('showSafetyDisclaimer')}
                />
              </label>

              <label className="toggle-switch-label">
                <div className="toggle-switch-text">
                  <strong>Auto-open report after AI analysis</strong>
                  <span>Automatically display printable A4 report modal upon inference completion</span>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={Boolean(settings.autoOpenReport)}
                  onChange={() => handleToggle('autoOpenReport')}
                />
              </label>

              <label className="toggle-switch-label">
                <div className="toggle-switch-text">
                  <strong>Enable SheetJS Excel export</strong>
                  <span>Allow one-click downloading of structured screening workbooks</span>
                </div>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={Boolean(settings.enableExcelExport)}
                  onChange={() => handleToggle('enableExcelExport')}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>Save Workstation Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
