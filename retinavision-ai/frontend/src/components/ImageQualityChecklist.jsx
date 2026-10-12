import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function ImageQualityChecklist({ checklist, onChange, disabled }) {
  const items = [
    { key: 'focusSharpness', label: 'Focus & Sharpness', desc: 'Retinal vessels and foveal reflex sharply defined' },
    { key: 'maculaCentered', label: 'Macula Centered', desc: 'Standard 45-degree field centered on the fovea centralis' },
    { key: 'opticDiscVisible', label: 'Optic Disc Visible', desc: 'Neuroretinal rim and cup boundaries clearly demarcated' },
    { key: 'adequateIllumination', label: 'Adequate Illumination', desc: 'Uniform exposure without severe shadow or excessive flash glare' },
    { key: 'noSevereMotionBlur', label: 'Motion Stability', desc: 'Absence of double-vascular contours or saccadic motion artifacts' },
    { key: 'artifactFree', label: 'Artifact Free', desc: 'Clear optical path without eyelash shadows, condensation, or lens dust' }
  ];

  const passCount = Object.values(checklist).filter(Boolean).length;
  const isAllPassed = passCount === items.length;

  const handleToggle = (key) => {
    if (disabled || !onChange) return;
    onChange({
      ...checklist,
      [key]: !checklist[key]
    });
  };

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div>
          <div className="card-title" style={{ fontSize: '0.92rem' }}>
            <ShieldCheck size={18} color="var(--teal)" />
            6-Point Clinical Quality Gate
          </div>
          <div className="card-subtitle">
            Automated + Clinician Verification Checklist
          </div>
        </div>
        <span
          className={`badge ${isAllPassed ? 'badge-success' : 'badge-amber'}`}
          style={{ fontSize: '0.78rem' }}
        >
          {passCount}/{items.length} Criteria Passed
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {items.map((item) => {
          const checked = !!checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => handleToggle(item.key)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: checked ? 'var(--greenbg)' : '#f8fafc',
                border: `1px solid ${checked ? 'rgba(22,135,93,0.25)' : 'var(--line)'}`,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {checked ? (
                  <CheckCircle2 size={16} color="var(--green)" />
                ) : (
                  <XCircle size={16} color="#94a3b8" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: checked ? '#116c4a' : 'var(--navy)'
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

