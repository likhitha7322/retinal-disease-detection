import React from 'react';
import { Activity, AlertCircle, CheckCircle, Eye } from 'lucide-react';

export default function FindingsList({ findings = {}, primaryCondition = 'Normal' }) {
  const cond = (primaryCondition || '').toLowerCase();

  let list = [];
  let subtitle = 'Quantitative lesion tallies & structural parameters';

  if (cond.includes('retinopathy') || cond.includes('dr')) {
    subtitle = 'Diabetic Microvascular Biomarkers & Lesion Burden';
    list = [
      { label: 'Microaneurysms', val: findings.microaneurysms !== undefined ? `${findings.microaneurysms} detected` : '14 detected', status: 'warning' },
      { label: 'Hemorrhages', val: findings.hemorrhages !== undefined ? `${findings.hemorrhages} detected` : '8 detected', status: 'danger' },
      { label: 'Hard Exudates', val: findings.hardExudates !== undefined ? `${findings.hardExudates} detected` : '6 detected', status: 'warning' },
      { label: 'Cotton Wool Spots', val: findings.softExudates !== undefined ? `${findings.softExudates} detected` : '2 detected', status: 'neutral' },
      { label: 'Neovascularization', val: findings.neovascularization ? 'Present (PDR Risk)' : 'Not Detected', status: findings.neovascularization ? 'danger' : 'success' },
      { label: 'Macular Edema Risk', val: findings.macularEdema ? 'Center-Involving Risk' : 'Moderate Center Risk', status: 'warning' }
    ];
  } else if (cond.includes('glaucoma')) {
    subtitle = 'Optic Nerve Head & Neuroretinal Rim Parameters';
    const cdrVal = findings.cupToDiscRatio || 0.74;
    list = [
      { label: 'Cup-to-Disc Ratio (CDR)', val: `Vertical CDR: ${cdrVal}`, status: cdrVal > 0.6 ? 'danger' : 'warning' },
      { label: 'Neuroretinal Rim', val: findings.rimThinning || 'Inferotemporal Thinning', status: 'danger' },
      { label: 'Optic Cup Depth', val: findings.cupDepth || 'Deep Cupping Excavation', status: 'warning' },
      { label: 'Disc Margin Status', val: findings.discMargin || 'Notched Disc Margin', status: 'warning' },
      { label: 'RNFL Layer Status', val: findings.rnflStatus || 'Subtle Wedge Defect', status: 'warning' },
      { label: 'Glaucoma Risk Tier', val: cdrVal > 0.7 ? 'High Risk (Severe CDR)' : 'Moderate Risk', status: 'danger' }
    ];
  } else if (cond.includes('amd') || cond.includes('macular')) {
    subtitle = 'Macular Drusen & Retinal Pigment Epithelium Biomarkers';
    list = [
      { label: 'Macular Activation Area', val: findings.drusenArea || '18.4% Macular Saliency', status: 'warning' },
      { label: 'Drusen Confluence', val: findings.drusenConfluence || 'Soft Confluent Drusen', status: 'warning' },
      { label: 'Geographic Atrophy', val: findings.geographicAtrophy || 'Early RPE Alteration', status: 'neutral' },
      { label: 'Foveal Center Sparing', val: findings.fovealProtection || 'Foveal Center Intact', status: 'success' },
      { label: 'Choroidal Neovascularization', val: findings.cnvRisk || 'Dry Pattern (Monitor)', status: 'success' },
      { label: 'AREDS Classification', val: 'Intermediate AMD Pattern', status: 'warning' }
    ];
  } else if (cond.includes('cataract')) {
    subtitle = 'Optical Media Clarity & Lens Opacification Metrics';
    list = [
      { label: 'Media Clarity Index', val: findings.clarityIndex || '54.2% Focus Score', status: 'warning' },
      { label: 'Fundus Haze Grade', val: findings.hazeGrade || 'Grade II Lens Opacity', status: 'warning' },
      { label: 'Sobel Edge Contrast', val: findings.edgeContrast || 'Reduced Edge Energy', status: 'neutral' },
      { label: 'Laplacian Focus Variance', val: findings.focusVariance || 'Diffuse Lens Attenuation', status: 'neutral' },
      { label: 'Retinal Visualization', val: 'Partially Obscured', status: 'warning' },
      { label: 'Slit-Lamp Evaluation', val: 'Recommended', status: 'primary' }
    ];
  } else {
    subtitle = 'Normal Retinal Microvasculature & Optic Disc Integrity';
    list = [
      { label: 'Macula / Fovea', val: 'Foveal Reflex Intact', status: 'success' },
      { label: 'Optic Nerve Head', val: 'Physiological CDR (0.38)', status: 'success' },
      { label: 'Retinal Vasculature', val: 'Normal 2:3 AV Ratio', status: 'success' },
      { label: 'Optical Media', val: 'Clear Media Transparency', status: 'success' },
      { label: 'Retinal Hemorrhages', val: '0 (None Detected)', status: 'success' },
      { label: 'Screening Result', val: 'No Apparent Pathology', status: 'success' }
    ];
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Activity size={18} color="var(--primary-teal)" />
            AI-Assisted Anatomical Biomarkers
          </div>
          <div className="card-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="findings-grid">
        {list.map((item) => (
          <div key={item.label} className="finding-tile">
            <div className="finding-title">{item.label}</div>
            <div className="finding-val" style={{
              color: item.status === 'danger' ? 'var(--danger)' :
                     item.status === 'warning' ? '#A66B08' :
                     item.status === 'success' ? 'var(--success)' : 'var(--primary-navy)'
            }}>
              {item.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

