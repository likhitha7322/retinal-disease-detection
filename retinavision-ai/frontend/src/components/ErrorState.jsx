import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'System Connection Notice', message = 'Unable to communicate with the screening service.', onRetry }) {
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }}>
          <AlertTriangle size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger)' }}>{title}</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
            {message}
          </p>
          <div style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '6px' }}>
            Verify that the Python PyTorch AI service and FastAPI backend server on port 8000 are active.
          </div>
          {onRetry && (
            <button onClick={onRetry} className="btn btn-outline btn-sm" style={{ marginTop: '14px' }}>
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

