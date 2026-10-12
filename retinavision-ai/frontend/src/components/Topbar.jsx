import React from 'react';
import { Bell, Menu, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, subtitle, onToggleMobile }) {
  const { showToast } = useAppContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Signed out of clinical workstation.', 'info');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'PS';
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="topbar no-print">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobile}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-title">
          <h2>{title || 'Clinical Retinal Screening Workstation'}</h2>
          <p>{subtitle || 'Retinal disease screening • Ophthalmology Department'}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Quality Gate Live Badge */}
        <div className="live-badge" title="Physiological Quality Gate active on all uploads">
          <div className="live-dot" />
          <span>System Live &bull; Quality Gate Active</span>
        </div>

        <div className="topbar-divider" />

        {/* Notifications */}
        <button
          className="btn-secondary btn-sm"
          style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          title="Clinical Notifications (3 pending reviews)"
          onClick={() => showToast('3 High-Risk retinal cases awaiting clinician review.', 'info')}
        >
          <Bell size={16} color="var(--primary-navy)" />
        </button>

        {/* Doctor Profile */}
        <div className="user-profile">
          <div className="user-avatar" title={user?.fullName || 'Dr. Priya Sharma'}>
            {getInitials(user?.fullName)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'Dr. Priya Sharma'}</div>
            <div className="user-role">{user?.role || 'Ophthalmologist'}</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Sign Out of Workstation"
          style={{ padding: '6px 10px', marginLeft: '6px' }}
        >
          <LogOut size={14} color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
