import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserRound,
  Upload,
  Brain,
  History,
  Database,
  Settings,
  CircleHelp,
  Activity,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const navGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }
      ]
    },
    {
      title: 'CLINICAL WORKFLOW',
      items: [
        { to: '/patient', label: 'Patient Details', icon: UserRound },
        { to: '/upload', label: 'Fundus Upload', icon: Upload },
        { to: '/analysis', label: 'AI Analysis', icon: Brain },
        { to: '/history', label: 'Screening History', icon: History }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/model', label: 'Model Information', icon: Database },
        { to: '/settings', label: 'Settings', icon: Settings },
        { to: '/help', label: 'Help & Support', icon: CircleHelp }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`sidebar no-print ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-symbol">
            <Activity size={20} />
          </div>
          <div className="brand-text">
            <h1>RetinaVision AI</h1>
            <p>AI-Based Retinal Disease Detection</p>
          </div>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="nav-group">
              <div className="nav-group-title">{group.title}</div>
              <ul className="nav-list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={onCloseMobile}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Engine Status */}
        <div className="sidebar-footer">
          <div className="engine-pill">
            <strong>EfficientNet-B3 Engine</strong>
            <span>Multi-Task DR + REFUGE U-Net</span>
            <div style={{ marginTop: '3px', fontSize: '10px', color: '#7EA4BC' }}>
              v2.1.0 &bull; PyTorch CUDA
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
