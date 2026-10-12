import React from 'react';

/**
 * Centered, low-opacity sketch of a human eye matching the background
 * of the user's splash screen reference.
 * Non-interactive, fixed in the background, never compromises readability.
 */
export default function EyeWatermark() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        width="820"
        height="500"
        viewBox="0 0 800 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0.065,
          transform: 'scale(1.05)',
          maxWidth: '92vw',
          maxHeight: '85vh',
        }}
      >
        {/* Upper eyelid contour & crease */}
        <path
          d="M 120 250 C 220 140, 480 120, 680 230"
          stroke="#16356B"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 170 215 C 270 125, 470 105, 630 190"
          stroke="#16356B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
        <path
          d="M 140 240 C 240 135, 470 115, 670 225"
          stroke="#1F4FBF"
          strokeWidth="1.2"
        />

        {/* Lower eyelid contour */}
        <path
          d="M 120 250 C 220 340, 490 350, 680 230"
          stroke="#16356B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 160 270 C 260 355, 480 365, 640 250"
          stroke="#16356B"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Outer and inner canthus detailing */}
        <path d="M 120 250 C 105 255, 95 250, 85 245" stroke="#16356B" strokeWidth="1.5" />
        <path d="M 120 250 C 110 260, 100 265, 88 255" stroke="#16356B" strokeWidth="1.5" />
        <path d="M 680 230 C 700 225, 715 220, 730 215" stroke="#16356B" strokeWidth="1.8" />

        {/* Iris Circle & Inner Highlights */}
        <circle cx="400" cy="240" r="95" stroke="#16356B" strokeWidth="3" fill="none" />
        <circle cx="400" cy="240" r="90" stroke="#1F4FBF" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="400" cy="240" r="82" stroke="#16356B" strokeWidth="0.8" />

        {/* Radiating Iris Striations */}
        <g stroke="#1F4FBF" strokeWidth="1.0" opacity="0.8">
          {[...Array(24)].map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x1 = 400 + Math.cos(angle) * 50;
            const y1 = 240 + Math.sin(angle) * 50;
            const x2 = 400 + Math.cos(angle) * 88;
            const y2 = 240 + Math.sin(angle) * 88;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>

        {/* Pupil & Specular Reflection */}
        <circle cx="400" cy="240" r="42" stroke="#16356B" strokeWidth="2.5" fill="#16356B" fillOpacity="0.35" />
        <circle cx="400" cy="240" r="32" stroke="#16356B" strokeWidth="1.5" />
        <circle cx="420" cy="225" r="14" stroke="#16356B" strokeWidth="1.5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Upper Eyelashes (Fine curved pencil strokes) */}
        <path d="M 210 190 C 205 160, 195 140, 185 125" stroke="#16356B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 260 165 C 255 135, 250 115, 240 95" stroke="#16356B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 320 148 C 320 115, 315 95, 310 75" stroke="#16356B" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 380 140 C 385 110, 390 90, 390 70" stroke="#16356B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 440 142 C 450 115, 460 95, 470 78" stroke="#16356B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 500 152 C 515 125, 530 108, 545 92" stroke="#16356B" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 560 170 C 580 145, 600 130, 620 118" stroke="#16356B" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 620 200 C 645 180, 665 170, 690 160" stroke="#16356B" strokeWidth="1.4" strokeLinecap="round" />

        {/* Lower Eyelashes */}
        <path d="M 260 315 C 255 335, 250 350, 240 365" stroke="#16356B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 340 330 C 340 350, 335 365, 330 380" stroke="#16356B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 420 335 C 425 355, 430 370, 435 385" stroke="#16356B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 500 325 C 510 345, 520 360, 530 372" stroke="#16356B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 580 300 C 595 318, 610 330, 625 340" stroke="#16356B" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

