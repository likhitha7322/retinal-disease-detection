import React from 'react';
import { CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import { QUALITY_CHECKLIST_ITEMS } from '../utils/constants';

export default function QualityChecklist({ statusMap = {}, gatePassed = true, qualityScore = 0.92 }) {
  const getItemState = (id) => {
    if (statusMap[id] !== undefined) return statusMap[id];
    return gatePassed ? 'Passed' : (id === 'qualityGate' ? 'Failed' : 'Passed');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <ShieldCheck size={18} color="var(--primary-teal)" />
            6-Point Image Quality Checklist
          </div>
          <div className="card-subtitle">
            Automated image quality verification &amp; physiological pre-filter
          </div>
        </div>
        <span className={`badge ${gatePassed ? 'badge-success' : 'badge-danger'}`}>
          {gatePassed ? 'Gate Passed' : 'Gate Failed'}
        </span>
      </div>

      <div className="quality-checklist">
        {QUALITY_CHECKLIST_ITEMS.map((item) => {
          const state = getItemState(item.id);
          const isPassed = state === 'Passed';
          const isFailed = state === 'Failed';
          const isChecking = state === 'Checking';

          return (
            <div key={item.id} className="checklist-item">
              <div className="checklist-label">
                {isPassed && <CheckCircle2 size={16} color="var(--success)" />}
                {isFailed && <XCircle size={16} color="var(--danger)" />}
                {isChecking && <RefreshCw size={16} className="spin" color="var(--primary-teal)" />}
                {!isPassed && !isFailed && !isChecking && <Clock size={16} color="var(--muted-text)" />}
                <span>{item.label}</span>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  color: isPassed ? 'var(--success)' : isFailed ? 'var(--danger)' : 'var(--muted-text)'
                }}
              >
                {state}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
        <span style={{ color: 'var(--muted-text)', fontWeight: 500 }}>Physiological Quality Score:</span>
        <strong style={{ fontSize: '14px', color: gatePassed ? 'var(--primary-teal)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
          {(qualityScore * 100).toFixed(1)} / 100
        </strong>
      </div>
    </div>
  );
}

