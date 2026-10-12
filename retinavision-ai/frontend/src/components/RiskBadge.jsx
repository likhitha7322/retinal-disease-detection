import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function RiskBadge({ level, status }) {
  if (status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'pending review':
      case 'pending':
        return (
          <span className="badge badge-amber">
            <Clock size={12} />
            Pending Review
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  }

  const normalized = (level || '').toLowerCase();
  if (normalized.includes('high')) {
    return (
      <span className="badge badge-high">
        <AlertCircle size={12} />
        High Risk
      </span>
    );
  }
  if (normalized.includes('mod') || normalized.includes('borderline')) {
    return (
      <span className="badge badge-moderate">
        <AlertTriangle size={12} />
        Moderate Risk
      </span>
    );
  }
  return (
    <span className="badge badge-low">
      <CheckCircle2 size={12} />
      Low Risk
    </span>
  );
}

