import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AnalysisProgress({ stepName = 'Running AI Model...', percent = 65 }) {
  const steps = [
    'Uploading Image',
    'Checking Image Quality',
    'Running AI Model',
    'Generating Explanation',
    'Analysis Complete'
  ];

  const currentIdx = steps.findIndex((s) => stepName.toLowerCase().includes(s.toLowerCase())) >= 0
    ? steps.findIndex((s) => stepName.toLowerCase().includes(s.toLowerCase()))
    : 2;

  return (
    <div className="progress-card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-navy)' }}>
            AI Neural Diagnostic Inference
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px' }}>
            Executing PyTorch Multi-Task EfficientNet-B3 + REFUGE LightUNet
          </p>
        </div>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-teal)', fontFamily: 'var(--font-mono)' }}>
          {percent}%
        </span>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="progress-step-pill">
        <RefreshCw size={16} className="spin" />
        <span>Current Step: {stepName}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', color: 'var(--muted-text)' }}>
        {steps.map((st, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: active ? 1 : done ? 0.8 : 0.4 }}>
              {done ? (
                <CheckCircle2 size={13} color="var(--success)" />
              ) : (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: active ? 'var(--primary-teal)' : '#CBD5E1' }} />
              )}
              <span style={{ fontWeight: active ? 700 : 500, color: active ? 'var(--primary-navy)' : 'inherit' }}>
                {st}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

