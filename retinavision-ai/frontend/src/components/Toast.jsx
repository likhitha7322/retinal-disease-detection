import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Toast() {
  const { toast, hideToast } = useAppContext();

  if (!toast) return null;

  const Icon = toast.type === 'error' ? AlertTriangle : toast.type === 'info' ? Info : CheckCircle2;

  return (
    <div className="toast-container no-print">
      <div className={`toast toast-${toast.type || 'success'}`}>
        <Icon size={18} />
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={hideToast}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

