import React, { useState, useEffect } from 'react';
import CircuitEyeLogo from './CircuitEyeLogo';
import EyeWatermark from './EyeWatermark';
import { api } from '../services/api';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Pixel-accurate recreation of the user's splash screen visual reference.
 * Probes /api/health to confirm the real PyTorch model is online before transitioning.
 */
export default function SplashScreen({ onComplete }) {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'offline'
  const [healthInfo, setHealthInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMsg('');
    try {
      const data = await api.getHealth();
      if (data && data.status === 'healthy') {
        setHealthInfo(data);
        setStatus('connected');
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1200);
      } else {
        throw new Error('Inference server reported degraded status.');
      }
    } catch (err) {
      console.warn('Backend health check failed:', err.message);
      setStatus('offline');
      setErrorMsg(err.message || 'Unable to connect to RetinaVision AI backend.');
    }
  };

  // Auto-proceed after 8 seconds even if backend is slow to avoid stuck splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus((prev) => {
        if (prev === 'checking') {
          if (onComplete) onComplete();
        }
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F6FD 45%, #E2EDFA 100%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Background Eye Sketch Watermark */}
      <EyeWatermark />

      {/* Main Center Content matching screenshot */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Center Circuit Eye Logo */}
        <div style={{ marginBottom: '8px', transform: 'scale(1.15)' }}>
          <CircuitEyeLogo size={84} />
        </div>

        {/* Wordmark: RetinaVision AI */}
        <h1
          style={{
            margin: '4px 0 0',
            fontSize: '34px',
            fontWeight: '700',
            color: '#16356B',
            letterSpacing: '-0.3px',
          }}
        >
          RetinaVision AI
        </h1>

        {/* Curved Tagline SVG: AI-Based Retinal Disease Detection */}
        <div style={{ width: '320px', height: '54px', marginTop: '-6px' }}>
          <svg width="320" height="54" viewBox="0 0 320 54" fill="none">
            {/* Gentle curved path beneath the title */}
            <path
              id="tagline-arc"
              d="M 15 15 Q 160 52 305 15"
              fill="none"
              stroke="none"
            />
            <text fill="#1F4FBF" fontSize="13.5" fontWeight="600" letterSpacing="0.4px">
              <textPath href="#tagline-arc" startOffset="50%" textAnchor="middle">
                AI-Based Retinal Disease Detection
              </textPath>
            </text>
          </svg>
        </div>

        {/* Real Backend Connection Status Indicator */}
        <div style={{ marginTop: '28px', minHeight: '48px' }}>
          {status === 'checking' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 18px',
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(180, 205, 240, 0.8)',
                borderRadius: '30px',
                fontSize: '13px',
                color: '#16356B',
                boxShadow: '0 4px 16px rgba(31, 79, 191, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <RefreshCw size={14} className="spin" style={{ color: '#1F4FBF' }} />
              <span>Connecting to Neural Diagnostic Engine (Port 8000)...</span>
            </div>
          )}

          {status === 'connected' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 20px',
                background: 'rgba(235, 250, 243, 0.9)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '30px',
                fontSize: '13px',
                color: '#065F46',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#10B981' }} />
              <span>
                Connected • {healthInfo?.device?.toUpperCase() === 'CUDA' ? 'CUDA Acceleration Active' : 'Model Ready (CPU)'}
              </span>
            </div>
          )}

          {status === 'offline' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '30px',
                  fontSize: '12.5px',
                  color: '#991B1B',
                  fontWeight: '500',
                }}
              >
                <AlertTriangle size={15} style={{ color: '#EF4444' }} />
                <span>Backend offline. Run: <code>.\venv\Scripts\python.exe -m uvicorn retina_ai.api:app --port 8000</code></span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  onClick={checkConnection}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#1F4FBF',
                    color: '#FFF',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(31, 79, 191, 0.25)'
                  }}
                >
                  <RefreshCw size={13} />
                  Retry Connection
                </button>
                <button
                  onClick={onComplete}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: '1px solid #C5D7F0',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#16356B',
                    fontSize: '12.5px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Proceed to App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer matching exact screenshot text */}
      <footer
        style={{
          position: 'absolute',
          bottom: '24px',
          zIndex: 2,
          fontSize: '13px',
          color: '#1F4FBF',
          fontWeight: '500',
          letterSpacing: '0.2px',
        }}
      >
        RetinaVision AI | AI-Based Retinal Disease Detection | © 2026
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

