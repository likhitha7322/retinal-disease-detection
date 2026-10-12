import React from 'react';
import { CircleHelp, ShieldCheck, Phone, Mail, FileCheck2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupport() {
  const navigate = useNavigate();

  const steps = [
    { num: '01', title: 'Register Patient', desc: 'Enter patient demographics, diabetic history, and referring clinical information in Patient Details.' },
    { num: '02', title: 'Upload Fundus Image', desc: 'Upload a 45° or 50° color retinal photograph (JPG/PNG) or choose a verified clinical preset.' },
    { num: '03', title: 'Quality Check', desc: 'Automatic 6-point physiological quality check verifies sharpness, centering, and illumination.' },
    { num: '04', title: 'Run AI Analysis', desc: 'Execute PyTorch EfficientNet-B3 model to compute 5-class pathology probabilities and ICDR DR stage.' },
    { num: '05', title: 'Review Result', desc: 'Inspect prediction, confidence, biomarker tallies, and Grad-CAM++ gradient saliency overlays.' },
    { num: '06', title: 'Generate Clinical Report', desc: 'Preview and print standardized A4 clinical consultation report with specialist signature block.' },
    { num: '07', title: 'Export Excel Record', desc: 'Download structured audit spreadsheet formatted with SheetJS (.xlsx) for clinical records.' }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 7-Step Workflow SOP Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileCheck2 size={18} color="var(--primary-teal)" />
              Standard Operating Procedure: 7-Step Retinal Screening Workflow
            </div>
            <div className="card-subtitle">
              Clinical protocol for AI-assisted vitreo-retinal diagnostic screening
            </div>
          </div>
          <span className="badge badge-info">SOP v2.1</span>
        </div>

        <div className="sop-step-grid">
          {steps.map((s) => (
            <div key={s.num} className="sop-step-card">
              <div className="sop-step-num">{s.num}</div>
              <div className="sop-step-title">{s.title}</div>
              <div className="sop-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/upload')} className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <span>Start Fundus Screening Workflow</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Safety & Contacts Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Safety & Regulatory Notice */}
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldCheck size={18} color="var(--warning)" />
                Medical Device Clinical Safety Notice
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: 600 }}>
            AI output is intended for screening assistance and requires appropriate clinician review.
          </p>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
            RetinaVision AI is classified as Software as a Medical Device (SaMD) intended for vitreo-retinal triage. All predictions must be correlated with dilated slit-lamp biomicroscopy, intraocular pressure (IOP), and optical coherence tomography (OCT) where clinically indicated.
          </p>
        </div>

        {/* Support Contacts */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <CircleHelp size={18} color="var(--primary-teal)" />
                Departmental Support Contacts
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <Phone size={16} color="var(--primary-teal)" />
              <div>
                <strong>Vitreo-Retina Triage Hotline:</strong>
                <div style={{ color: 'var(--muted-text)', fontSize: '11.5px' }}>+91 (080) 4129-8800 (Ext. 204)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <Mail size={16} color="var(--primary-teal)" />
              <div>
                <strong>Clinical Informatics Team:</strong>
                <div style={{ color: 'var(--muted-text)', fontSize: '11.5px' }}>retina.support@apexeyeinstitute.org</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
