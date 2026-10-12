import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingState({ message = 'Processing clinical data...' }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted-text)' }}>
      <RefreshCw size={26} className="spin" style={{ color: 'var(--primary-teal)', margin: '0 auto 12px' }} />
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-navy)' }}>{message}</div>
    </div>
  );
}

