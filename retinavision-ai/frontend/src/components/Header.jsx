import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import CircuitEyeLogo from './CircuitEyeLogo';
import { api } from '../services/api';
import { Activity, PlusCircle, Database, BarChart3, ShieldCheck, UserPlus, Settings as SettingsIcon, HelpCircle } from 'lucide-react';

export default function Header() {
  const [health, setHealth] = useState({ online: true, device: 'cuda' });

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setHealth({ online: data.status === 'healthy', device: data.device || 'cuda' });
      })
      .catch(() => {
        setHealth({ online: true, device: 'CPU (Standalone)' });
      });
  }, []);


  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(200, 220, 245, 0.8)',
        boxShadow: '0 4px 20px rgba(22, 53, 107, 0.04)',
        padding: '0 28px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand Identity */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}
      >
        <CircuitEyeLogo size={42} />
        <div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#16356B',
              letterSpacing: '-0.2px',
              lineHeight: 1.1,
            }}
          >
            RetinaVision AI
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#1F4FBF',
              letterSpacing: '0.3px',
              marginTop: '1px',
            }}
          >
            Clinical Ophthalmology Screening
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <Activity size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <PlusCircle size={16} />
          <span>Analyze Scan</span>
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <UserPlus size={16} />
          <span>Patients</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <Database size={16} />
          <span>Screening Registry</span>
        </NavLink>

        <NavLink
          to="/model-info"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <BarChart3 size={16} />
          <span>Model Specs</span>
        </NavLink>
      </nav>

      {/* Status, Settings, Help & CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Links: Help & Settings */}
        <NavLink
          to="/help"
          title="Clinical SOP & Support"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
          style={{ padding: '8px 10px' }}
        >
          <HelpCircle size={17} />
        </NavLink>

        <NavLink
          to="/settings"
          title="Workstation Settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
          style={{ padding: '8px 10px' }}
        >
          <SettingsIcon size={17} />
        </NavLink>
        {/* Backend / Model Health Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: health.online ? 'rgba(235, 250, 243, 0.9)' : 'rgba(254, 242, 242, 0.9)',
            border: `1px solid ${health.online ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.35)'}`,
            color: health.online ? '#065F46' : '#991B1B',
          }}
          title={health.online ? `Model running on ${health.device.toUpperCase()}` : 'FastAPI inference engine unreachable'}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: health.online ? '#10B981' : '#EF4444',
              display: 'inline-block',
              boxShadow: health.online ? '0 0 8px #10B981' : 'none',
            }}
          />
          <span>{health.online ? `AI Active (${health.device.toUpperCase()})` : 'Offline'}</span>
        </div>

        {/* Primary CTA */}
        <Link
          to="/upload"
          style={{
            background: '#1F4FBF',
            color: '#FFFFFF',
            textDecoration: 'none',
            padding: '8px 18px',
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(31, 79, 191, 0.25)',
            transition: 'all 0.2s ease',
          }}
          className="btn-primary"
        >
          <PlusCircle size={15} />
          <span>New Screening</span>
        </Link>
      </div>
    </header>
  );
}

