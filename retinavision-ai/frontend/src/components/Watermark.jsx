import React from 'react';

export default function Watermark() {
  return (
    <div className="watermark-overlay" aria-hidden="true">
      <svg
        className="watermark-svg"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Retinal Eye Outline */}
        <path
          d="M 40 200 Q 200 60 360 200 Q 200 340 40 200 Z"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
        />
        {/* Iris and Pupil */}
        <circle cx="200" cy="200" r="70" strokeWidth="2.5" stroke="currentColor" fill="none" />
        <circle cx="200" cy="200" r="35" strokeWidth="2" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
        <circle cx="188" cy="188" r="8" fill="currentColor" fillOpacity="0.3" />

        {/* Retinal Vasculature / Circuit Nodes */}
        <path d="M 200 130 Q 220 90 270 70" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" fill="none" />
        <path d="M 200 270 Q 230 310 290 330" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" fill="none" />
        <path d="M 130 200 Q 90 180 50 160" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" fill="none" />
        <path d="M 270 200 Q 310 210 350 190" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" fill="none" />
        
        <circle cx="270" cy="70" r="4" fill="currentColor" />
        <circle cx="290" cy="330" r="4" fill="currentColor" />
        <circle cx="50" cy="160" r="4" fill="currentColor" />
        <circle cx="350" cy="190" r="4" fill="currentColor" />
      </svg>
      <div className="watermark-text">
        RETINAVISION AI &bull; CLINICAL RETINAL SCREENING &bull; &copy; 2026
      </div>
    </div>
  );
}

