import React from 'react';
import { Cpu, ShieldCheck, Activity, Target, Layers, Info } from 'lucide-react';

export default function DiseaseModelInfoCard({ primaryCondition = 'Normal' }) {
  const cond = (primaryCondition || '').toLowerCase();

  let diseaseName = 'Normal Retinal Tissue';
  let diseaseKey = 'Normal';
  let metrics = { precision: '78.2%', recall: '82.1%', f1: '80.1%', support: '624 test scans' };
  let badgeColor = { bg: '#E0F2FE', text: '#0369A1' };
  let architecture = 'EfficientNet-B3 Base Classifier (300x300 RGB)';

  let lesionsGuide = [];
  let modelFocusText = '';

  if (cond.includes('retinopathy') || cond.includes('dr')) {
    diseaseName = 'Diabetic Retinopathy (DR)';
    diseaseKey = 'Diabetic_Retinopathy';
    metrics = { precision: '83.2%', recall: '80.7%', f1: '81.9%', support: '607 test scans' };
    badgeColor = { bg: '#FEE2E2', text: '#991B1B' };
    architecture = 'EfficientNet-B3 Dual-Head Multi-Task + LesionUNet';
    modelFocusText = 'Saliency localized on macular arcades, capillary non-perfusion zones, and microvascular lesions.';
    lesionsGuide = [
      { name: 'Microaneurysms', desc: 'Tiny red focal capillary wall outpouchings (earliest clinical sign of DR).' },
      { name: 'Intraretinal Hemorrhages', desc: 'Flame-shaped or dot-blot blood accumulations in deep retinal layers.' },
      { name: 'Hard Exudates', desc: 'Waxy yellow lipid/lipoprotein deposits with sharp clear margins.' },
      { name: 'Cotton Wool Spots', desc: 'Fluffy white spots indicating retinal nerve fiber layer micro-infarction.' },
      { name: 'Neovascularization', desc: 'Abnormal fragile vessels on disc (NVD) or elsewhere (NVE) signaling PDR.' }
    ];
  } else if (cond.includes('glaucoma')) {
    diseaseName = 'Glaucoma (Optic Neuropathy)';
    diseaseKey = 'Glaucoma';
    metrics = { precision: '48.1%', recall: '39.7%', f1: '43.5%', support: '63 test scans (Oversampled)' };
    badgeColor = { bg: '#FEF3C7', text: '#92400E' };
    architecture = 'EfficientNet-B3 + REFUGE LightUNet (Cup-to-Disc Ratio)';
    modelFocusText = 'Dual-head segmentation of optic cup & disc margins with vertical Cup-to-Disc Ratio (CDR) extraction.';
    lesionsGuide = [
      { name: 'Cup-to-Disc Ratio (CDR)', desc: 'Vertical Cup Height / Disc Height. CDR > 0.65 indicates glaucomatous cupping.' },
      { name: 'Neuroretinal Rim Thinning', desc: 'Loss of nerve fibers (ISNT rule violation: Inferior > Superior > Nasal > Temporal).' },
      { name: 'Optic Cup Excavation', desc: 'Deepening and widening of the central optic cup cavity.' },
      { name: 'Disc Margin Notching', desc: 'Localized focal loss of neuroretinal rim tissue.' },
      { name: 'RNFL Defect', desc: 'Retinal nerve fiber layer wedge-shaped loss extending toward optic disc.' }
    ];
  } else if (cond.includes('amd') || cond.includes('macular')) {
    diseaseName = 'Age-Related Macular Degeneration (AMD)';
    diseaseKey = 'AMD';
    metrics = { precision: '94.4%', recall: '93.0%', f1: '93.7%', support: '342 test scans' };
    badgeColor = { bg: '#CCFBF1', text: '#0F766E' };
    architecture = 'EfficientNet-B3 Saliency Head + Macular Proxy Evaluator';
    modelFocusText = 'Attention map focused on central 5.5mm macular zone, RPE alteration, and drusen confluence.';
    lesionsGuide = [
      { name: 'Macular Drusen', desc: 'Extracellular acellular lipid deposits beneath Retinal Pigment Epithelium (RPE).' },
      { name: 'Soft Confluent Drusen', desc: 'Large (>125µm) coalescing drusen associated with high AMD progression risk.' },
      { name: 'RPE Hyperpigmentation', desc: 'Pigmentary clumps or focal areas of hyperpigmentation in macula.' },
      { name: 'Geographic Atrophy', desc: 'Sharply demarcated regions of RPE loss revealing underlying choroidal vessels.' },
      { name: 'CNV Fluid Risk', desc: 'Choroidal neovascular membrane fluid leakage signaling wet AMD.' }
    ];
  } else if (cond.includes('cataract')) {
    diseaseName = 'Cataract (Lens Opacification)';
    diseaseKey = 'Cataract';
    metrics = { precision: '66.7%', recall: '70.0%', f1: '68.3%', support: '60 test scans' };
    badgeColor = { bg: '#E0E7FF', text: '#3730A3' };
    architecture = 'Sobel Edge Contrast Engine + Laplacian Focus Variance Analyzer';
    modelFocusText = 'Evaluates optical media turbidity, vessel edge gradient magnitude, and image focus variance.';
    lesionsGuide = [
      { name: 'Media Clarity Index', val: 'Focus Score', desc: 'Quantifies light transmission attenuation through crystalline lens.' },
      { name: 'Fundus Haze Grade', desc: 'Grade I to IV opacity causing diffuse blurring of retinal details.' },
      { name: 'Vessel Edge Contrast', desc: 'Sobel gradient magnitude across major arcade vessels.' },
      { name: 'Laplacian Variance', desc: 'Sharpness metric measuring high-frequency image intensity variations.' },
      { name: 'Visual Obscuration', desc: 'Overall clouding preventing clear visualization of posterior pole.' }
    ];
  } else {
    diseaseName = 'Normal Retinal Microvasculature';
    diseaseKey = 'Normal';
    metrics = { precision: '78.2%', recall: '82.1%', f1: '80.1%', support: '624 test scans' };
    badgeColor = { bg: '#D1FAE5', text: '#065F46' };
    architecture = 'EfficientNet-B3 Primary Pathology Classifier';
    modelFocusText = 'Intact foveal reflex, normal 2:3 AV ratio, sharp optic disc margins, and clear optical media.';
    lesionsGuide = [
      { name: 'Macula / Fovea', desc: 'Healthy foveal avascular zone (FAZ) with intact foveal reflex.' },
      { name: 'Optic Nerve Head', desc: 'Normal pink neuroretinal rim with physiological CDR (0.30 - 0.45).' },
      { name: 'Retinal Vasculature', desc: 'Regular vessel caliber with 2:3 arteriole-to-venule ratio and no crossing changes.' },
      { name: 'Retinal Background', desc: 'Homogeneous orange-red fundus background with zero microaneurysms or hemorrhages.' },
      { name: 'Optical Media', desc: 'Transparent ocular media allowing sharp visualization of retinal layers.' }
    ];
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div>
          <div className="card-title" style={{ fontSize: '15px', color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--primary-teal)" />
            Model Specification &amp; Lesion Findings Guide
          </div>
          <div className="card-subtitle">
            Pathology-specific neural metrics &amp; anatomical lesion definitions
          </div>
        </div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: badgeColor.bg,
            color: badgeColor.text
          }}
        >
          {diseaseName}
        </span>
      </div>

      {/* Model Performance Metrics Strip for this Disease */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          backgroundColor: 'var(--surface-alt)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)',
          marginBottom: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Precision (PPV)
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '2px' }}>
            {metrics.precision}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Sensitivity (Recall)
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--deep-navy)', marginTop: '2px' }}>
            {metrics.recall}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            F1-Score
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--deep-navy)', marginTop: '2px' }}>
            {metrics.f1}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Test Support
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px' }}>
            {metrics.support}
          </div>
        </div>
      </div>

      {/* Neural Network Attention Focus Description */}
      <div style={{ padding: '10px 12px', backgroundColor: 'rgba(19, 143, 152, 0.08)', borderRadius: '6px', borderLeft: '3px solid var(--primary-teal)', marginBottom: '16px', fontSize: '12px', color: 'var(--deep-navy)', lineHeight: 1.5 }}>
        <strong>Neural Network Focus ({architecture}):</strong> {modelFocusText}
      </div>

      {/* Pathology-Specific Lesions List */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Target size={14} color="var(--primary-teal)" />
        <span>Key Anatomical Lesions &amp; Diagnostic Criteria for {diseaseName}:</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lesionsGuide.map((item, idx) => (
          <div
            key={item.name}
            style={{
              padding: '10px 12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--primary-navy)' }}>
              {idx + 1}. {item.name}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
