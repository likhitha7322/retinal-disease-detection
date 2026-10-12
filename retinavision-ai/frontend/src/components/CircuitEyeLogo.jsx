import React from 'react';

/**
 * High-fidelity SVG recreation of the RetinaVision AI Circuit-Eye Logo
 * extracted from the official splash screen visual reference.
 */
export default function CircuitEyeLogo({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Circuit Nodes & Traces (Radiating to top-left and top) */}
      <g stroke="#1F4FBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Trace 1 - Top left diagonal */}
        <path d="M 45 45 L 30 30 L 18 30" />
        <circle cx="16" cy="30" r="3.5" fill="#1F4FBF" />

        {/* Trace 2 - Left horizontal upper */}
        <path d="M 38 52 L 20 52 L 12 44" />
        <circle cx="10" cy="44" r="3.5" fill="#1F4FBF" />

        {/* Trace 3 - Left horizontal lower */}
        <path d="M 40 65 L 24 65 L 16 73" />
        <circle cx="14" cy="73" r="3.5" fill="#1F4FBF" />

        {/* Trace 4 - Top vertical */}
        <path d="M 60 38 L 60 22 L 50 12" />
        <circle cx="50" cy="10" r="3.5" fill="#1F4FBF" />

        {/* Trace 5 - Top vertical right branch */}
        <path d="M 60 22 L 72 12" />
        <circle cx="74" cy="10" r="3.5" fill="#1F4FBF" />

        {/* Trace 6 - Upper right branch */}
        <path d="M 75 42 L 88 30" />
        <circle cx="90" cy="28" r="3.5" fill="#1F4FBF" />

        {/* Trace 7 - Lower left branch */}
        <path d="M 48 78 L 36 90" />
        <circle cx="34" cy="92" r="3.5" fill="#1F4FBF" />
      </g>

      {/* Outer Eye Outline / Ring */}
      <circle cx="64" cy="62" r="26" stroke="#1F4FBF" strokeWidth="3" fill="#FFFFFF" />

      {/* Iris Pattern */}
      <circle cx="64" cy="62" r="18" fill="#2563EB" />
      <circle cx="64" cy="62" r="14" fill="#1F4FBF" />

      {/* Radial Iris Spokes */}
      <g stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
        <line x1="64" y1="46" x2="64" y2="50" />
        <line x1="64" y1="74" x2="64" y2="78" />
        <line x1="48" y1="62" x2="52" y2="62" />
        <line x1="76" y1="62" x2="80" y2="62" />
        <line x1="53" y1="51" x2="56" y2="54" />
        <line x1="72" y1="70" x2="75" y2="73" />
        <line x1="53" y1="73" x2="56" y2="70" />
        <line x1="72" y1="54" x2="75" y2="51" />
      </g>

      {/* Pupil */}
      <circle cx="64" cy="62" r="8.5" fill="#0E275A" />

      {/* Specular Highlight */}
      <circle cx="67" cy="59" r="3" fill="#FFFFFF" />
      <circle cx="62" cy="64" r="1.5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

