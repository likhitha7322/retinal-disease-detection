import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Key, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await login(email, password);
      showToast('Clinician authenticated successfully.', 'success');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email address or password.');
      showToast('Sign in failed. Check credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('doctor@retinavision.ai');
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B2438',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Accent Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#138F98 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Header Strip */}
        <div
          style={{
            backgroundColor: '#12304A',
            padding: '28px 32px 24px',
            textAlign: 'center',
            color: '#FFFFFF'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#138F98',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(19, 143, 152, 0.4)'
            }}
          >
            <Activity size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            RetinaVision AI
          </h1>
          <p style={{ fontSize: '12px', color: '#9AB0C2', marginTop: '3px' }}>
            Clinical Ophthalmology Screening Workstation
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2438', marginBottom: '4px' }}>
            Clinician Sign In
          </h2>
          <p style={{ fontSize: '12px', color: '#71808C', marginBottom: '20px' }}>
            Enter your hospital credentials to access diagnostic tools
          </p>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FDF2F3',
                border: '1px solid rgba(195, 62, 73, 0.3)',
                color: '#C33E49',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '6px', display: 'block' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@retinavision.ai"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '6px', display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workstation'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Quick Demo Credentials Fill Button */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8ED', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                background: 'none',
                border: 'none',
                color: '#138F98',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserCheck size={14} />
              <span>Use Demo Clinician Account (Dr. Priya Sharma)</span>
            </button>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#71808C' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#138F98' }}>
              Register Specialist Profile &rarr;
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

