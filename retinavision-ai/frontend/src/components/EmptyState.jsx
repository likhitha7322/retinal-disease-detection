import React from 'react';
import { Eye, PlusCircle } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'No records available in the clinical system.', actionLabel, onAction, icon: Icon = Eye }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '24px auto' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--teal-light)', color: 'var(--primary-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-navy)' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--muted-text)', marginTop: '6px', marginBottom: '20px' }}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <PlusCircle size={15} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

