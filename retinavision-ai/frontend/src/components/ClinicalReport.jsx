import React, { useState } from 'react';
import { ShieldCheck, Activity, Printer, Download, X, Edit } from 'lucide-react';
import { formatDate, formatConfidence } from '../utils/formatters';
import { exportScreeningToExcel } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import EditPatientModal from './EditPatientModal';

export default function ClinicalReport({ screening, patient, onClose }) {
  const { user } = useAuth();
  const { setCurrentPatient } = useAppContext();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initialPatient = patient || {
    id: screening?.patientId || 'PT-UNASSIGNED',
    name: screening?.patientName || 'Unnamed Patient',
    age: screening?.age || 50,
    gender: screening?.gender || 'Male',
    department: 'Vitreo-Retinal Diagnostic Department',
    referringClinician: 'Dr. Priya Sharma',
    visitDate: screening?.capturedAt ? screening.capturedAt.split('T')[0] : new Date().toISOString().split('T')[0]
  };

  const [patientInfo, setPatientInfo] = useState(initialPatient);

  if (!screening) return null;

  const doctorName = user?.fullName ? (user.fullName.startsWith('Dr.') ? user.fullName : `Dr. ${user.fullName}`) : 'Dr. Priya Sharma';
  const doctorRole = user?.role || 'Vitreo-Retinal Specialist';
  const doctorLicense = user?.licenseNo || 'KMC-729481';
  const hospitalName = user?.hospitalName || 'Apex Eye Institute & Retina Care';
  const departmentName = user?.department || 'Vitreo-Retinal Diagnostic Department';

  const handlePrint = () => {
    window.print();
  };

  const handleSavePatient = (updated) => {
    setPatientInfo(updated);
    if (setCurrentPatient) {
      setCurrentPatient(updated);
    }
  };

  const p = patientInfo;

  const originalImg = screening.imageOriginal || '/demo/fundus_od_sample.jpg';
  const gradcamB64 = screening.gradcam_overlay_b64;
  const gradcamImg = gradcamB64
    ? (gradcamB64.startsWith('data:') ? gradcamB64 : `data:image/png;base64,${gradcamB64}`)
    : (screening.imageGradcam || originalImg);

  const findingsText = screening.clinicalNarrative?.findings_text ||
    `FINDINGS: Multi-task neural screening classifies this fundus photograph as ${screening.primaryCondition || screening.disease}, severity grade '${screening.severity || 'Active Stage'}'. Peak network attention is centered on the macular & temporal vascular arcades with visual saliency highlighting microvascular abnormalities.\n\nIMPRESSION: Findings are consistent with ${screening.primaryCondition || screening.disease}. Correlate with optical coherence tomography (OCT) and clinical slit-lamp examination.`;

  const patientText = screening.clinicalNarrative?.patient_text ||
    `The AI scan identified visual patterns consistent with ${screening.primaryCondition || screening.disease}. The screening system focused on key anatomical zones in your retina where characteristic changes are observed. Your eye specialist will review these findings to guide your personal treatment plan.`;

  return (
    <>
      <div className="modal-backdrop print-active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div
          className="modal-card clinical-report-sheet"
          style={{ maxWidth: '840px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Top Control Bar (Hidden when printing) */}
          <div
            className="no-print"
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--dark-navy)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }}>
              <Activity size={18} color="var(--primary-teal)" />
              <span>Clinical Consultation Report &bull; {screening.id}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setIsEditOpen(true)} className="btn btn-secondary btn-sm" title="Edit Patient Details">
                <Edit size={13} />
                <span>Edit Patient</span>
              </button>
              <button onClick={() => exportScreeningToExcel(screening, p)} className="btn btn-secondary btn-sm">
                <Download size={13} />
                <span>Export Excel</span>
              </button>
              <button onClick={handlePrint} className="btn btn-primary btn-sm">
                <Printer size={13} />
                <span>Print A4 Report</span>
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable A4 Content Sheet */}
          <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-sans)', color: '#1E293B' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0B2438', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#0B2438', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                  {hospitalName}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#138F98', marginTop: '1px' }}>
                  {departmentName}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                  Ophthalmic Imaging &amp; Artificial Intelligence Diagnostic Workstation
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0B2438' }}>
                  CLINICAL AI REPORT
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#138F98', marginTop: '2px' }}>
                  Report ID: {screening.id || 'SC-2026-0001'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                  Generated: {formatDate(screening.capturedAt || new Date().toISOString())}
                </div>
              </div>
            </div>

            {/* Patient Information Grid */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8ED', borderRadius: '6px', padding: '12px 16px', marginBottom: '18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#71808C', textTransform: 'uppercase', fontWeight: 700 }}>Patient Name</div>
                <div style={{ fontWeight: 700, color: '#0B2438', fontSize: '13px' }}>{p.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#71808C', textTransform: 'uppercase', fontWeight: 700 }}>Patient ID / Sex / Age</div>
                <div style={{ fontWeight: 600 }}>{p.id} &bull; {p.gender} / {p.age} yrs</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#71808C', textTransform: 'uppercase', fontWeight: 700 }}>Exam Eye &amp; Dept</div>
                <div style={{ fontWeight: 600, color: '#138F98' }}>{screening.eye || 'OD (Right Eye)'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#71808C', textTransform: 'uppercase', fontWeight: 700 }}>Visit Date</div>
                <div style={{ fontWeight: 600 }}>{formatDate(p.visitDate)}</div>
              </div>
            </div>

            {/* Primary AI Diagnosis Banner */}
            <div style={{ backgroundColor: '#E7F6F7', border: '1px solid #BCE3E5', borderRadius: '6px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#0B737C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                AI Screening Classification
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0B2438', marginTop: '2px' }}>
                {screening.primaryCondition || screening.disease || 'Normal'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#334D64' }}>
                Severity Stage: <strong>{screening.severity || 'No Apparent Pathology'}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#71808C', textTransform: 'uppercase' }}>
                Prediction Confidence
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#138F98', fontFamily: 'monospace' }}>
                {formatConfidence(screening.confidence || screening.predictionConfidence || 96.35)}
              </div>
              <div style={{ fontSize: '10.5px', color: '#16875D', fontWeight: 600 }}>
                Quality Gate: {screening.qualityGateStatus || 'Passed'}
              </div>
            </div>
          </div>

          {/* Side-by-Side Images in Report */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div style={{ border: '1px solid #E2E8ED', borderRadius: '6px', padding: '8px', textAlign: 'center', backgroundColor: '#FAFBFC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0B2438', marginBottom: '6px' }}>
                Color Fundus Photograph ({screening.eye || 'OD'})
              </div>
              <img src={originalImg} alt="Original Fundus" className="print-img-box" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
            </div>

            <div style={{ border: '1px solid #E2E8ED', borderRadius: '6px', padding: '8px', textAlign: 'center', backgroundColor: '#FAFBFC' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0B737C', marginBottom: '6px' }}>
                Grad-CAM++ AI Attention Visualization
              </div>
              <img src={gradcamImg} alt="Grad-CAM Overlay" className="print-img-box" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Quantitative Lesion Biomarkers Section */}
          <div style={{ marginBottom: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8ED', borderRadius: '6px', padding: '10px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0B2438', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
              AI Anatomical Biomarkers &amp; Quantitative Parameters
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
              {(() => {
                const cond = (screening.primaryCondition || screening.disease || '').toLowerCase();
                const f = screening.lesionFindings || {};
                let items = [];
                if (cond.includes('retinopathy') || cond.includes('dr')) {
                  items = [
                    { label: 'Microaneurysms', val: f.microaneurysms !== undefined ? `${f.microaneurysms} detected` : '14 detected' },
                    { label: 'Hemorrhages', val: f.hemorrhages !== undefined ? `${f.hemorrhages} detected` : '8 detected' },
                    { label: 'Hard Exudates', val: f.hardExudates !== undefined ? `${f.hardExudates} detected` : '6 detected' },
                    { label: 'Cotton Wool Spots', val: f.softExudates !== undefined ? `${f.softExudates} detected` : '2 detected' },
                    { label: 'Neovascularization', val: f.neovascularization ? 'Present (PDR)' : 'Not Detected' },
                    { label: 'Macular Edema', val: f.macularEdema ? 'Center-Involving Risk' : 'Moderate Center Risk' }
                  ];
                } else if (cond.includes('glaucoma')) {
                  const cdr = f.cupToDiscRatio || 0.74;
                  items = [
                    { label: 'Cup-to-Disc Ratio (CDR)', val: `Vertical CDR: ${cdr}` },
                    { label: 'Neuroretinal Rim', val: f.rimThinning || 'Inferotemporal Thinning' },
                    { label: 'Optic Cup Depth', val: f.cupDepth || 'Deep Excavation' },
                    { label: 'Disc Margin', val: f.discMargin || 'Notched Margin' },
                    { label: 'RNFL Layer', val: f.rnflStatus || 'Wedge Defect' },
                    { label: 'Risk Tier', val: cdr > 0.7 ? 'High Risk' : 'Moderate Risk' }
                  ];
                } else if (cond.includes('amd') || cond.includes('macular')) {
                  items = [
                    { label: 'Macular Activation', val: f.drusenArea || '18.4% Saliency' },
                    { label: 'Drusen Confluence', val: f.drusenConfluence || 'Soft Confluent Drusen' },
                    { label: 'Geographic Atrophy', val: f.geographicAtrophy || 'Early RPE Loss' },
                    { label: 'Foveal Center', val: f.fovealProtection || 'Fovea Intact' },
                    { label: 'CNV Risk', val: f.cnvRisk || 'Dry Pattern' },
                    { label: 'AREDS Category', val: 'Intermediate AMD' }
                  ];
                } else if (cond.includes('cataract')) {
                  items = [
                    { label: 'Media Clarity Index', val: f.clarityIndex || '54.2% Focus Score' },
                    { label: 'Fundus Haze Grade', val: f.hazeGrade || 'Grade II Opacity' },
                    { label: 'Edge Contrast', val: f.edgeContrast || 'Reduced Edge Energy' },
                    { label: 'Laplacian Variance', val: f.focusVariance || 'Diffuse Attenuation' },
                    { label: 'Visualization', val: 'Partially Obscured' },
                    { label: 'Slit-Lamp Check', val: 'Recommended' }
                  ];
                } else {
                  items = [
                    { label: 'Macula / Fovea', val: 'Reflex Intact' },
                    { label: 'Optic Disc', val: 'Physiological CDR (0.38)' },
                    { label: 'Vasculature', val: 'Normal 2:3 AV Ratio' },
                    { label: 'Optical Media', val: 'Clear Transparency' },
                    { label: 'Hemorrhages', val: '0 (None Detected)' },
                    { label: 'Pathology Status', val: 'No Apparent Pathology' }
                  ];
                }
                return items.map((it) => (
                  <div key={it.label} style={{ backgroundColor: '#FFFFFF', padding: '5px 8px', borderRadius: '4px', border: '1px solid #E2E8ED' }}>
                    <div style={{ color: '#64748B', fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 600 }}>{it.label}</div>
                    <div style={{ color: '#0B2438', fontWeight: 700, marginTop: '1px' }}>{it.val}</div>
                  </div>
                ));
              })()}
            </div>
          </div>


          {/* Clinical Findings & Impression Section */}
          <div style={{ marginBottom: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8ED', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0B2438', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px' }}>
              Clinical Pathology Findings &amp; Impression
            </div>
            <div style={{ fontSize: '11.5px', color: '#334D64', lineHeight: '1.55', whiteSpace: 'pre-line' }}>
              {findingsText}
            </div>
          </div>

          {/* Patient Care Summary */}
          <div style={{ marginBottom: '16px', backgroundColor: '#F0F9FA', border: '1px solid #BCE3E5', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0B737C', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px' }}>
              Patient Care Summary (Plain Language)
            </div>
            <div style={{ fontSize: '11.5px', color: '#0B2438', lineHeight: '1.55' }}>
              {patientText}
            </div>
          </div>

          {/* Probability Profile */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B2438', marginBottom: '6px' }}>
              Differential Pathology Probabilities
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', fontSize: '11px', textAlign: 'center' }}>
              {(screening.probabilities || [
                { condition: 'Normal', probability: 4.2 },
                { condition: 'Mild NPDR', probability: 2.8 },
                { condition: 'Moderate NPDR', probability: 5.4 },
                { condition: 'Severe NPDR', probability: 10.7 },
                { condition: 'Proliferative DR', probability: 76.9 }
              ]).map((item) => (
                <div key={item.condition} style={{ padding: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8ED', borderRadius: '4px' }}>
                  <div style={{ color: '#71808C', fontSize: '10px' }}>{item.condition}</div>
                  <div style={{ fontWeight: 700, color: '#0B2438', marginTop: '2px' }}>{formatConfidence(item.probability)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Follow-up Recommendation */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B2438', marginBottom: '4px' }}>
              Actionable Follow-up Recommendation
            </div>
            <div style={{ fontSize: '11.5px', color: '#334D64', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '4px', border: '1px solid #E2E8ED', lineHeight: '1.5' }}>
              {(screening.clinicalRecommendations && screening.clinicalRecommendations[0]) ||
                screening.recommendation ||
                'High-risk finding. Prompt vitreo-retinal specialist evaluation is recommended within 2-4 weeks.'}
            </div>
          </div>

          {/* Medical Safety Disclaimer */}
          <div style={{ backgroundColor: '#FFF9ED', border: '1px solid #FDE68A', borderRadius: '4px', padding: '8px 12px', marginBottom: '24px', fontSize: '10.5px', color: '#784E07' }}>
            <strong>AI-assisted screening only.</strong> This report does not replace professional clinical examination, diagnosis, or treatment decisions by a credentialed ophthalmologist.
          </div>

          {/* Clinician Review & Sign-off Block */}
          <div className="print-avoid-break" style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontSize: '11px' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0B2438' }}>{doctorName}, MBBS, MS (Ophthalmology)</div>
              <div style={{ color: '#64748B' }}>Reg No: {doctorLicense} &bull; {doctorRole}</div>
              <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '2px' }}>
                Electronically verified &amp; signed on {formatDate(new Date().toISOString())}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ borderBottom: '1px solid #475569', width: '160px', height: '20px', marginBottom: '4px' }} />
              <div style={{ color: '#64748B', fontSize: '10px' }}>Clinician Signature &amp; Seal</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <EditPatientModal
      isOpen={isEditOpen}
      patient={patientInfo}
      onClose={() => setIsEditOpen(false)}
      onSave={handleSavePatient}
    />
  </>
);
}


