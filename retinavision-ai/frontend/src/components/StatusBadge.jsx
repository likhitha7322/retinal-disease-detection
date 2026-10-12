import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';

export default function StatusBadge({ status, level, gate }) {
  const val = (level || status || gate || '').toString().toLowerCase();

  if (val.includes('high') || val.includes('urgent') || val.includes('failed') || val.includes('proliferative')) {
    return (
      <span className="badge badge-danger">
        <AlertTriangle size={12} />
        <span>{level || status || 'High Risk'}</span>
      </span>
    );
  }

  if (val.includes('moderate') || val.includes('warning') || val.includes('pending') || val.includes('review')) {
    return (
      <span className="badge badge-warning">
        <Clock size={12} />
        <span>{level || status || 'Priority Review'}</span>
      </span>
    );
  }

  if (val.includes('low') || val.includes('normal') || val.includes('pass') || val.includes('completed')) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} />
        <span>{level || status || 'Low Risk'}</span>
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <span>{level || status || 'Standard'}</span>
    </span>
  );
}

