import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title = 'Confirm Action', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop no-print" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDanger && <AlertTriangle size={20} color="var(--danger)" />}
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-navy)' }}>{title}</h3>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary btn-sm">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-sm`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

