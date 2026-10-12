import React from 'react';
import { formatConfidence } from '../utils/formatters';

export default function ProbabilityBars({ probabilities = [], primaryCondition = 'Normal' }) {
  // Standard 5 trained clinical classes fallback
  const defaultList = [
    { condition: 'Normal', probability: 4.2 },
    { condition: 'Mild NPDR', probability: 2.8 },
    { condition: 'Moderate NPDR', probability: 5.4 },
    { condition: 'Severe NPDR', probability: 10.7 },
    { condition: 'Proliferative DR', probability: 76.9 }
  ];

  const items = (probabilities && probabilities.length > 0) ? probabilities : defaultList;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            Disease Probability Profile
          </div>
          <div className="card-subtitle">
            5-class softmax differential output distribution
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => {
          const name = item.condition || item.label || 'Unknown';
          const prob = item.probability !== undefined ? item.probability : 0;
          const isHighest = (primaryCondition || '').toLowerCase().includes(name.toLowerCase()) || prob > 50;

          return (
            <div key={name} className={`prob-item ${isHighest ? 'highlight' : ''}`}>
              <div className="prob-header">
                <span className="prob-name">{name}</span>
                <span className="prob-value">{formatConfidence(prob)}</span>
              </div>
              <div className="prob-track">
                <div
                  className="prob-fill"
                  style={{ width: `${prob <= 1 ? prob * 100 : prob}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

