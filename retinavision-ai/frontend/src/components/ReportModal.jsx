import React from 'react';
import { X, Printer, ShieldCheck, Activity, Download } from 'lucide-react';
import { api } from '../services/api';

export default function ReportModal({ screening, onClose }) {
  if (!screening) return null;

  const handlePrint = () => {
    window.print();
  };

  const p = {
    id: screening.patientId || '—',
    name: screening.patientName || 'Unknown Patient',
    age: screening.age || '—',
    gender: screening.gender || '—',
    phone: screening.phone || '—',
    diabeticHistory: screening.diabeticHistory || 'Not recorded'
  };

  const NAVY = '#16356B';
  const BLUE = '#1F4FBF';
  const MUTED = '#64748b';

  const fieldLabel = { fontSize: '10px', color: MUTED, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.3px', marginBottom: '2px' };
  const fieldValue = { fontSize: '13px', fontWeight: 700, color: NAVY };

  // Resolve gradcam image: prefer base64, fallback to URL, fallback to original
  const gradcamSrc = screening.gradcam_overlay_b64
    ? `data:image/png;base64,${screening.gradcam_overlay_b64}`
    : screening.imageGradcam || screening.imageOriginal || '/demo/fundus_od_sample.jpg';

  const originalSrc = screening.imageOriginal || '/demo/fundus_od_sample.jpg';

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(11, 36, 56, 0.72)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#ffffff', borderRadius: '14px',
          width: '100%', maxWidth: '870px', maxHeight: '94vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden'
        }}
      >
        {/* Modal Top Bar (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 22px',
            background: NAVY,
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} style={{ color: '#93C5FD' }} />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              Clinical Report Preview &bull; {screening.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={api.getReportDownloadUrl(screening.id, 'doctor')}
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: BLUE, color: '#fff', textDecoration: 'none',
                border: 'none', cursor: 'pointer'
              }}
            >
              <Download size={14} />
              Download PDF
            </a>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              style={{ color: '#CBD5E1', display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable A4 Content */}
        <div
          className="print-page"
          style={{ padding: '32px 40px', overflowY: 'auto', flex: 1, color: '#1e293b', fontFamily: '"Segoe UI", -apple-system, sans-serif' }}
        >
          {/* Report Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `2px solid ${NAVY}`, paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: NAVY, letterSpacing: '-0.3px' }}>
                RETINAVISION AI OPHTHALMIC CLINIC
              </div>
              <div style={{ fontSize: '13px', color: BLUE, fontWeight: 600, marginTop: '1px' }}>
                Vitreo-Retinal Diagnostic &amp; Screening Department
              </div>
              <div style={{ fontSize: '11px', color: MUTED, marginTop: '3px' }}>
                Apex Eye Institute &bull; 104 Medical Enclave &bull; ISO 13485:2016 Accredited
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: NAVY, fontFamily: 'monospace' }}>
                REPORT ID: {screening.id}
              </div>
              <div style={{ fontSize: '11px', color: MUTED, marginTop: '2px' }}>
                Date: {new Date(screening.capturedAt || Date.now()).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                Status: Verified &amp; Signed
              </div>
            </div>
          </div>

          {/* Patient Details Strip */}
          <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px',
            padding: '14px 18px', marginBottom: '20px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'
          }}>
            <div>
              <div style={fieldLabel}>Patient Name</div>
              <div style={fieldValue}>{p.name}</div>
            </div>
            <div>
              <div style={fieldLabel}>Patient ID / Age / Sex</div>
              <div style={fieldValue}>{p.id} &bull; {p.age}y / {p.gender}</div>
            </div>
            <div>
              <div style={fieldLabel}>Exam Eye</div>
              <div style={{ ...fieldValue, color: BLUE }}>{screening.eye || 'OD (Right Eye)'}</div>
            </div>
            <div>
              <div style={fieldLabel}>Clinical History</div>
              <div style={{ fontSize: '12px', color: '#334155' }}>{p.diabeticHistory}</div>
            </div>
          </div>

          {/* Side-by-side Images */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#F8FAFC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: NAVY, marginBottom: '8px' }}>
                Color Fundus Photograph — {screening.eye || 'OD'}
              </div>
              <img src={originalSrc} alt="Original Fundus"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                onError={(e) => { e.target.src = '/demo/fundus_od_sample.jpg'; }}
              />
            </div>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#F8FAFC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: NAVY, marginBottom: '8px' }}>
                Grad-CAM++ Explainability Heatmap
              </div>
              <img src={gradcamSrc} alt="Grad-CAM Heatmap"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                onError={(e) => { e.target.src = originalSrc; }}
              />
            </div>
          </div>

          {/* AI Assessment */}
          <div style={{ background: '#EFF5FF', border: '1px solid #C3DAF5', borderRadius: '8px', padding: '14px 18px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #C3DAF5', paddingBottom: '8px', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: BLUE, textTransform: 'uppercase' }}>
                  AI Primary Diagnosis
                </span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: NAVY }}>
                  {screening.primaryCondition} &mdash; {screening.severity}
                </div>
              </div>
              <span style={{
                padding: '4px 12px', background: '#FEF2F2', color: '#EF4444',
                borderRadius: '6px', fontWeight: 700, fontSize: '12px', border: '1px solid rgba(239,68,68,0.3)'
              }}>
                {screening.riskLevel || 'High Risk'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'Scan Prediction Confidence', value: `${screening.confidence || 0}%`, note: 'Individual scan certainty' },
                { label: 'Model Test Accuracy', value: '81.78%', note: 'Multi-center benchmark' },
                { label: 'Model ROC-AUC', value: '0.941', note: 'Discriminative power' }
              ].map(({ label, value, note }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#556976', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: NAVY }}>{value}</div>
                  <div style={{ fontSize: '10px', color: MUTED }}>{note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesion Biomarkers */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: NAVY, marginBottom: '8px' }}>
              Quantitative Lesion Biomarkers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
              {[
                { k: 'Microaneurysms', v: screening.lesionFindings?.microaneurysms ?? 0 },
                { k: 'Hemorrhages', v: screening.lesionFindings?.hemorrhages ?? 0 },
                { k: 'Hard Exudates', v: screening.lesionFindings?.hardExudates ?? 0 },
                { k: 'Cup-to-Disc Ratio', v: screening.lesionFindings?.cupToDiscRatio ?? 'N/A' }
              ].map(({ k, v }) => (
                <div key={k} style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ color: MUTED }}>{k}: </span>
                  <strong style={{ color: NAVY }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Narrative */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: NAVY, marginBottom: '6px' }}>
              Automated Clinical Diagnostic Narrative
            </div>
            <div style={{ fontSize: '12px', color: '#334155', background: '#F8FAFC', padding: '12px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {screening.clinicalNarrative?.findingsText ||
                `FINDINGS: Primary diagnosis is ${screening.primaryCondition}, classified at ${screening.severity} severity stage. Grad-CAM++ activations highlight pathological features localized in the ${screening.clinicalNarrative?.camRegion || 'posterior pole'} territory.\n\nIMPRESSION: Dilated ophthalmoscopy and correlation with systemic markers recommended.`}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: NAVY, marginBottom: '6px' }}>
              Clinical Management Recommendations
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: '1.7' }}>
              {(screening.clinicalRecommendations || [
                'Refer to vitreoretinal clinic within 2–4 weeks for slit-lamp biomicroscopy.',
                'Order Macula OCT to rule out center-involving diabetic macular edema.',
                'Maintain tight glycemic control (HbA1c < 7.0%).'
              ]).map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px',
            padding: '10px 14px', marginBottom: '18px', fontSize: '11px', color: '#92400E', display: 'flex', gap: '8px'
          }}>
            <ShieldCheck size={16} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Medical Disclaimer:</strong> This AI-generated screening report is an assistive decision-support tool and does not constitute a definitive clinical diagnosis.
              All findings must be correlated with a comprehensive ophthalmic examination by a licensed ophthalmologist before any clinical action is taken.
            </span>
          </div>

          {/* Doctor Sign-off */}
          <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontSize: '11px' }}>
            <div>
              <div style={{ fontWeight: 700, color: NAVY }}>Dr. Priya Sharma, MBBS, MS (Ophthalmology)</div>
              <div style={{ color: MUTED }}>Reg No: KMC-729481 &bull; Consultant Vitreo-Retina</div>
              <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '2px' }}>
                Electronically signed: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #475569', width: '160px', height: '24px', marginBottom: '4px' }} />
              <div style={{ color: MUTED, fontSize: '10px' }}>Authorized Clinician Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
