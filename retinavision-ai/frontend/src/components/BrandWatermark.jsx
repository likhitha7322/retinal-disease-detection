import React from 'react';
import { Eye } from 'lucide-react';

export default function BrandWatermark() {
  return (
    <div className="brand-watermark-container" aria-hidden="true">
      <div className="brand-watermark-content">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Eye Outline */}
          <path d="M10 60C10 60 35 20 60 20C85 20 110 60 110 60C110 60 85 100 60 100C35 100 10 60 10 60Z" stroke="#12304A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Outer Iris Circle */}
          <circle cx="60" cy="60" r="24" stroke="#138F98" strokeWidth="2.5"/>
          {/* Inner Pupil */}
          <circle cx="60" cy="60" r="10" fill="#12304A"/>
          {/* Faint Macula & Vascular Arc Lines */}
          <path d="M60 10 V20 M60 100 V110 M10 60 H20 M100 60 H110" stroke="#138F98" strokeWidth="2" strokeDasharray="3 3"/>
          <path d="M25 25 L35 35 M85 85 L95 95 M95 25 L85 35 M25 95 L35 85" stroke="#138F98" strokeWidth="1.5"/>
        </svg>

        <div className="watermark-text-primary">RetinaVision AI</div>
        <div className="watermark-text-tagline">AI-Based Retinal Disease Detection</div>
        <div className="watermark-text-copy">© 2026</div>
      </div>
    </div>
  );
}

