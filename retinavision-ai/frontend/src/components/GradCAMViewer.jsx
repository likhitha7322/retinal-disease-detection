import React, { useState } from 'react';
import { Sliders, Eye, Layers } from 'lucide-react';

export default function GradCAMViewer({ originalImg, gradcamImg }) {
  const [viewMode, setViewMode] = useState('sideBySide'); // 'sideBySide', 'blend', 'gradcam'
  const [opacity, setOpacity] = useState(0.65);

  const hasGradcam = Boolean(gradcamImg);
  const resolvedGradcam = gradcamImg
    ? (gradcamImg.startsWith('data:') || gradcamImg.startsWith('http') || gradcamImg.startsWith('/')
      ? gradcamImg
      : `data:image/png;base64,${gradcamImg}`)
    : null;

  const resolvedOriginal = originalImg || '/demo/fundus_od_sample.jpg';

  return (
    <div className="card">
      <div className="viewer-header">
        <div>
          <div className="card-title">
            <Eye size={18} color="var(--primary-teal)" />
            Explainable AI (XAI) &bull; Grad-CAM++ Visualizer
          </div>
          <div className="card-subtitle">
            AI attention visualization showing gradient localization overlay
          </div>
        </div>

        {hasGradcam && (
          <div className="viewer-toggle-group">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`viewer-toggle-btn ${viewMode === 'sideBySide' ? 'active' : ''}`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('blend')}
              className={`viewer-toggle-btn ${viewMode === 'blend' ? 'active' : ''}`}
            >
              Opacity Blend
            </button>
            <button
              onClick={() => setViewMode('gradcam')}
              className={`viewer-toggle-btn ${viewMode === 'gradcam' ? 'active' : ''}`}
            >
              Heatmap
            </button>
          </div>
        )}
      </div>

      {!hasGradcam ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-text)' }}>
            Grad-CAM unavailable
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
            Explanation overlay was not returned by the inference service for this image.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'sideBySide' && (
            <div className="viewer-side-by-side">
              <div className="viewer-img-card">
                <h4>Raw Color Fundus Photograph</h4>
                <img src={resolvedOriginal} alt="Original Fundus Scan" className="viewer-img" />
              </div>
              <div className="viewer-img-card">
                <h4 style={{ color: 'var(--primary-teal)' }}>Grad-CAM++ AI Attention Heatmap</h4>
                <img
                  src={resolvedGradcam}
                  alt="Grad-CAM AI attention visualization"
                  className="viewer-img"
                />
              </div>
            </div>
          )}

          {viewMode === 'blend' && (
            <div>
              <div className="viewer-blend-container">
                <img src={resolvedOriginal} alt="Original Fundus Base" className="viewer-blend-base" />
                <img
                  src={resolvedGradcam}
                  alt="Grad-CAM Overlay"
                  className="viewer-blend-overlay"
                  style={{ opacity }}
                />
              </div>
              <div className="viewer-slider-bar">
                <Sliders size={16} color="var(--primary-teal)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-navy)', minWidth: '130px' }}>
                  Heatmap Opacity: {Math.round(opacity * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary-teal)' }}
                />
              </div>
            </div>
          )}

          {viewMode === 'gradcam' && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={resolvedGradcam}
                alt="Grad-CAM AI Attention Visualization"
                style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', backgroundColor: '#000', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}

          <div className="viewer-disclaimer-box">
            <strong>Disclaimer:</strong> Grad-CAM is an explanation aid showing neural activation focus and should not be interpreted as a lesion segmentation map.
          </div>
        </>
      )}
    </div>
  );
}

