import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, color = 'var(--primary-teal)', bg = 'var(--teal-light)', onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
    >
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className="stat-icon-wrap" style={{ backgroundColor: bg, color }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

