import React, { useState, useEffect } from 'react';
import {
  Database,
  Cpu,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart2,
  Calculator,
  AlertTriangle,
  FileText,
  Activity,
  Server
} from 'lucide-react';
import { getModelSpecs } from '../services/screeningService';

export default function ModelInformation() {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelSpecs()
      .then((data) => {
        setSpecs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Model specs fetch error:', err);
        setLoading(false);
      });
  }, []);

  const report = specs?.classificationReport || {
    AMD: { precision: 0.9436, recall: 0.9298, 'f1-score': 0.9367, support: 342 },
    Cataract: { precision: 0.6667, recall: 0.7000, 'f1-score': 0.6829, support: 60 },
    Diabetic_Retinopathy: { precision: 0.8319, recall: 0.8072, 'f1-score': 0.8194, support: 607 },
    Glaucoma: { precision: 0.4808, recall: 0.3968, 'f1-score': 0.4348, support: 63 },
    Normal: { precision: 0.7817, recall: 0.8205, 'f1-score': 0.8006, support: 624 },
    accuracy: 0.8178,
    'macro avg': { precision: 0.7409, recall: 0.7309, 'f1-score': 0.7349, support: 1696 },
    'weighted avg': { precision: 0.8171, recall: 0.8178, 'f1-score': 0.8170, support: 1696 }
  };

  const metrics = specs?.benchmarkMetrics || {
    testAccuracy: 81.78,
    macroAUC: 0.941,
    quadraticWeightedKappa: 0.88,
    expectedCalibrationError: 0.042,
    temperature: 1.68
  };

  const formatPct = (val) => {
    if (val === undefined || val === null) return 'N/A';
    const num = typeof val === 'number' ? val : parseFloat(val);
    return (num > 1 ? num : num * 100).toFixed(1) + '%';
  };

  const formatDec = (val, dec = 3) => {
    if (val === undefined || val === null) return 'N/A';
    return parseFloat(val).toFixed(dec);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Specifications Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.95) 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '28px 32px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#38BDF8',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Cpu size={30} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              AI Engine Release {specs?.version || 'v2.2.0'} &bull; PyTorch CUDA Inference &bull; Held-Out Test Set (N=1,696)
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#FFFFFF' }}>
              EfficientNet-B3 Dual-Head Multi-Task Architecture + REFUGE LightUNet
            </h1>
          </div>
        </div>

        {/* 4 Core Benchmark KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            background: 'rgba(255, 255, 255, 0.07)',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Overall Test Accuracy
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
              {formatPct(metrics.testAccuracy || report.accuracy)}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
              1,387 / 1,696 held-out test images
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Macro ROC-AUC
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {formatDec(metrics.macroAUC, 3)}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
              5-class discriminative AUC
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Quadratic Weighted Kappa
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
              {formatDec(metrics.quadraticWeightedKappa, 2)}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
              ICDR severity agreement score
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Calibration ECE
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>
              {formatDec(metrics.expectedCalibrationError, 3)}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
              Temperature scaled (T={metrics.temperature || 1.68})
            </div>
          </div>
        </div>
      </div>

      {/* Per-Class Performance & Calculations Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ fontSize: '17px', color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="var(--primary-teal)" />
              Pathology Breakdown &amp; Performance Calculations
            </div>
            <div className="card-subtitle">
              Detailed evaluation metrics per clinical pathology on 1,696 held-out test images
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>Clinical Class</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>Precision (PPV)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>Sensitivity (Recall)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>F1-Score</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>Support (N)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>Pathology Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'AMD', name: 'Age-Related Macular Degeneration (AMD)', badge: 'Excellent' },
                { key: 'Cataract', name: 'Cataract (Lens Opacification)', badge: 'Moderate' },
                { key: 'Diabetic_Retinopathy', name: 'Diabetic Retinopathy (DR)', badge: 'High Accuracy' },
                { key: 'Glaucoma', name: 'Glaucoma (Optic Cupping)', badge: 'Oversampled / Remediation' },
                { key: 'Normal', name: 'Normal Retinal Tissue', badge: 'High Precision' },
              ].map((row) => {
                const item = report[row.key] || {};
                const isGlaucoma = row.key === 'Glaucoma';
                return (
                  <tr
                    key={row.key}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: isGlaucoma ? 'rgba(254, 243, 199, 0.4)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--deep-navy)' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                      {formatPct(item.precision)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                      {formatPct(item.recall)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                      {formatPct(item['f1-score'])}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {item.support || 0} scans
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isGlaucoma
                            ? '#FEF3C7'
                            : row.key === 'AMD' || row.key === 'Diabetic_Retinopathy'
                            ? '#D1FAE5'
                            : '#E0F2FE',
                          color: isGlaucoma
                            ? '#92400E'
                            : row.key === 'AMD' || row.key === 'Diabetic_Retinopathy'
                            ? '#065F46'
                            : '#0369A1'
                        }}
                      >
                        {row.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Macro & Weighted Averages */}
              {report['macro avg'] && (
                <tr style={{ background: 'rgba(241, 245, 249, 0.8)', fontWeight: 700, borderTop: '2px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>Macro Average</td>
                  <td style={{ padding: '12px 14px', color: 'var(--primary-teal)' }}>{formatPct(report['macro avg'].precision)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>{formatPct(report['macro avg'].recall)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>{formatPct(report['macro avg']['f1-score'])}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{report['macro avg'].support} scans</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Unweighted mean</td>
                </tr>
              )}

              {report['weighted avg'] && (
                <tr style={{ background: 'rgba(241, 245, 249, 0.8)', fontWeight: 700 }}>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>Weighted Average</td>
                  <td style={{ padding: '12px 14px', color: 'var(--primary-teal)' }}>{formatPct(report['weighted avg'].precision)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>{formatPct(report['weighted avg'].recall)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--deep-navy)' }}>{formatPct(report['weighted avg']['f1-score'])}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{report['weighted avg'].support} scans</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Prevalence-weighted</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Mathematical Formulas & Calculation Methodology */}
      <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--primary-teal)' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ fontSize: '16px', color: 'var(--deep-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} color="var(--primary-teal)" />
              Clinical Calculation Formulas &amp; Evaluation Methodology
            </div>
            <div className="card-subtitle">
              Mathematical definitions powering RetinaVision AI model evaluation &amp; biomarker metrics
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-alt)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '4px' }}>
              1. Overall Diagnostic Accuracy
            </div>
            <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
              Accuracy = (TP + TN) / (TP + TN + FP + FN) = 1,387 / 1,696 = 81.78%
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Measures the proportion of correctly predicted scans across all 5 clinical categories.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--surface-alt)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '4px' }}>
              2. Sensitivity / Recall (True Positive Rate)
            </div>
            <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
              Recall = TP / (TP + FN)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Fraction of true diseased eyes correctly detected by AI. AMD: 93.0%, DR: 80.7%.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--surface-alt)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '4px' }}>
              3. Precision (Positive Predictive Value)
            </div>
            <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
              Precision = TP / (TP + FP)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Probability that a positive AI flag represents a true confirmed pathology. AMD: 94.4%.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--surface-alt)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--deep-navy)', marginBottom: '4px' }}>
              4. Vertical Cup-to-Disc Ratio (CDR)
            </div>
            <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
              CDR = Vertical Cup Height / Vertical Disc Height
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Extracted via REFUGE LightUNet segmentation. CDR &gt; 0.65 indicates severe glaucomatous cupping.
            </p>
          </div>
        </div>
      </div>

      {/* Real Evaluation Charts from Saved Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Confusion Matrix Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary-teal)' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                Test Set Confusion Matrix
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Held-out evaluation matrix across 5 target clinical pathology classes
              </p>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <img
              src="/reports_static/confusion_matrix.png"
              alt="Test set confusion matrix"
              style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '6px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Multi-Class ROC Curves Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary-teal)' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                Multi-Class ROC Curves (AUC = 0.941)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                One-vs-Rest Receiver Operating Characteristic curves per class
              </p>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <img
              src="/reports_static/roc_curve.png"
              alt="ROC Curves"
              style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '6px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* System Architecture & Lineage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left: Processing Pipeline */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Layers size={20} style={{ color: 'var(--primary-teal)' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                Multi-Stage Clinical Processing Pipeline
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                End-to-end diagnostic inference with fail-safe quality gating
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(235, 244, 255, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(200, 220, 245, 0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--deep-navy)' }}>
                Stage 1: Multi-Tier Fundus Gating (Geometric + FundusGateNet)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Physiological retinal color spectrum validation, blue-light absorption check (B_ratio &le; 0.32), 100px minimum dimension check, and binary classification rejecting non-fundus photos.
              </p>
            </div>

            <div style={{ background: 'rgba(235, 244, 255, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(200, 220, 245, 0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--deep-navy)' }}>
                Stage 2: Multi-Task Classification &bull; EfficientNet-B3 (300x300)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Pretrained on ImageNet with dual heads: 5-class primary pathology head + 5-grade Diabetic Retinopathy severity head (ICDR Grades 0 to 4). Optional CLAHE &amp; TTA 4-view ensemble.
              </p>
            </div>

            <div style={{ background: 'rgba(235, 244, 255, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(200, 220, 245, 0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--deep-navy)' }}>
                Stage 3: Optic Cup &amp; Disc Segmentation &bull; REFUGE LightUNet
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Computes vertical Cup-to-Disc Ratio (CDR) to detect glaucomatous cupping and neuroretinal rim thinning (CDR &gt; 0.65).
              </p>
            </div>

            <div style={{ background: 'rgba(235, 244, 255, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(200, 220, 245, 0.6)' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--deep-navy)' }}>
                Stage 4: Explainability (Grad-CAM++) &bull; Lesion Segmentation
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Generates high-resolution gradient heatmaps localized on pathological features, paired with LesionUNet biomarker tallies.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cohorts & Technical Lineage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Database size={20} style={{ color: 'var(--primary-teal)' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                  Training Cohorts &amp; Lineage
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--deep-navy)' }}>ODIR-5K Cohort</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  5,000 multi-disease bilateral fundus scans from 48 hospitals across China.
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--deep-navy)' }}>APTOS 2019 Blindness Detection</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  3,662 clinically graded Indian rural screening fundus images under field conditions.
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--deep-navy)' }}>AMDNet23 Maculopathy Cohort</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Dry &amp; wet AMD fundus photography with drusen &amp; geographic atrophy ground truth.
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Server size={20} style={{ color: 'var(--primary-teal)' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--deep-navy)' }}>
                  Runtime Engine Architecture
                </h3>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
                <span><strong>Model Engine:</strong> PyTorch 2.5.1 + CUDA 12.4 + timm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
                <span><strong>API Layer:</strong> FastAPI + Uvicorn (Asynchronous REST API)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
                <span><strong>Persistence:</strong> SQLite + SQLAlchemy Database</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--green)' }} />
                <span><strong>Reporting:</strong> ReportLab Automated Vector PDF Generator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
