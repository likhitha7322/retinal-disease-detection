import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  UploadCloud,
  History,
  Eye,
  ArrowRight,
  TrendingUp,
  Cpu,
  Users,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import EditPatientModal from '../components/EditPatientModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getDashboardStats, getScreeningHistory } from '../services/screeningService';
import { getPatients, saveLocalPatient, createPatient, deletePatient } from '../services/patientService';
import { formatDate, formatConfidence } from '../utils/formatters';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { setCurrentPatient, showToast } = useAppContext();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('screenings'); // 'screenings' | 'patients'

  useEffect(() => {
    Promise.all([
      getDashboardStats().catch(() => null),
      getScreeningHistory().catch(() => []),
      getPatients().catch(() => [])
    ]).then(([statsData, historyData, patientsData]) => {
      let mergedQueue = statsData?.recentQueue || [];
      if (historyData && historyData.length > 0) {
        const map = new Map();
        [...historyData, ...mergedQueue].forEach((item) => {
          if (item && item.id) map.set(item.id, item);
        });
        mergedQueue = Array.from(map.values()).sort(
          (a, b) => new Date(b.capturedAt || b.date || Date.now()) - new Date(a.capturedAt || a.date || Date.now())
        );
      }

      setStats({
        totalScreenings: Math.max(statsData?.totalScreenings ?? 0, historyData?.length ?? 0),
        pendingReviews: statsData?.pendingReviews ?? 0,
        highRiskCases: Math.max(statsData?.highRiskCases ?? 0, historyData?.filter((h) => (h.riskLevel || '').includes('High')).length ?? 0),
        normalRetinas: Math.max(statsData?.normalRetinas ?? 0, historyData?.filter((h) => (h.primaryCondition || '').includes('Normal')).length ?? 0),
        diseaseDistribution: statsData?.diseaseDistribution || {},
        recentQueue: mergedQueue
      });

      setPatients(patientsData || []);
    }).finally(() => setLoading(false));
  }, []);

  const total = stats?.totalScreenings ?? 0;
  const pending = stats?.pendingReviews ?? 0;
  const highRisk = stats?.highRiskCases ?? 0;
  const normal = stats?.normalRetinas ?? 0;

  const recentQueue = stats?.recentQueue || [];
  const diseaseDist = stats?.diseaseDistribution || {};

  // Build pathology breakdown list from backend API stats
  const distTotal = Object.values(diseaseDist).reduce((acc, c) => acc + (c || 0), 0);
  const distributionList = Object.entries(diseaseDist).map(([name, count]) => ({
    name,
    count: count || 0,
    pct: distTotal > 0 ? Math.round(((count || 0) / distTotal) * 100) : 0,
    color: name.toLowerCase().includes('normal')
      ? 'var(--success)'
      : name.toLowerCase().includes('retinopathy')
      ? 'var(--danger)'
      : name.toLowerCase().includes('glaucoma')
      ? 'var(--warning)'
      : 'var(--primary-teal)'
  }));

  const handleStartPatientScan = (patient) => {
    setCurrentPatient(patient);
    navigate('/upload');
  };

  return (
    <div className="dashboard-grid fade-in">
      {/* Quick Action Navigation Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Screening Overview &amp; Priority Triage
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--muted-text)', marginTop: '2px' }}>
            Vitreo-Retinal Diagnostic Workstation &bull; Real-Time Hospital Queue
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/patient')} className="btn btn-secondary btn-sm">
            <UserPlus size={14} />
            <span>New Patient</span>
          </button>
          <button onClick={() => navigate('/upload')} className="btn btn-primary btn-sm">
            <UploadCloud size={14} />
            <span>Upload Fundus</span>
          </button>
          <button onClick={() => navigate('/history')} className="btn btn-secondary btn-sm">
            <History size={14} />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* 4 Clinical Stat KPI Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Examinations"
          value={total.toString().padStart(2, '0')}
          subtext="Total processed fundus scans"
          icon={Activity}
          color="var(--primary-teal)"
          bg="var(--teal-light)"
          onClick={() => navigate('/history')}
        />
        <StatCard
          label="Registered Patients"
          value={patients.length.toString().padStart(2, '0')}
          subtext="Active clinical patient records"
          icon={Users}
          color="var(--primary-navy)"
          bg="#E2EDFA"
          onClick={() => navigate('/patient')}
        />
        <StatCard
          label="High-Risk Cases"
          value={highRisk.toString().padStart(2, '0')}
          subtext="Severe / Proliferative / Cupping"
          icon={AlertTriangle}
          color="var(--danger)"
          bg="var(--danger-bg)"
          onClick={() => navigate('/history?disease=Diabetic_Retinopathy')}
        />
        <StatCard
          label="Normal / Low Risk"
          value={normal.toString().padStart(2, '0')}
          subtext="Routine annual re-screening"
          icon={CheckCircle2}
          color="var(--success)"
          bg="var(--success-bg)"
          onClick={() => navigate('/history?disease=Normal')}
        />
      </div>

      {/* Priority Attention Alert Banner */}
      {highRisk > 0 && (
        <div className="priority-banner">
          <div className="priority-banner-left">
            <AlertTriangle size={20} color="var(--warning)" />
            <div>
              <strong>Priority Attention Required</strong>
              <span>{highRisk} high-risk screening cases awaiting immediate clinician review.</span>
            </div>
          </div>
          <button onClick={() => navigate('/history?disease=Diabetic_Retinopathy')} className="btn btn-secondary btn-sm">
            <span>Review High-Risk Queue</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Dashboard Main Split Layout */}
      <div className="dashboard-split-layout">
        {/* Left: Recent Screening Cases & Registered Patients Toggle */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 20px 12px', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('screenings')}
                style={{
                  background: activeTab === 'screenings' ? 'var(--teal-light)' : 'transparent',
                  color: activeTab === 'screenings' ? 'var(--primary-teal)' : 'var(--muted-text)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={15} />
                <span>Recent Screenings ({recentQueue.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                style={{
                  background: activeTab === 'patients' ? 'var(--teal-light)' : 'transparent',
                  color: activeTab === 'patients' ? 'var(--primary-teal)' : 'var(--muted-text)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={15} />
                <span>Registered Patients ({patients.length})</span>
              </button>
            </div>

            <button onClick={() => navigate(activeTab === 'screenings' ? '/history' : '/patient')} className="btn btn-outline btn-sm">
              <span>{activeTab === 'screenings' ? 'View Registry' : 'New Patient'}</span>
            </button>
          </div>

          {loading ? (
            <LoadingState message="Loading hospital queue..." />
          ) : activeTab === 'screenings' ? (
            /* Recent Screenings Table */
            <div className="clinical-table-wrapper" style={{ border: 'none' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Patient ID</th>
                    <th>Date</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQueue.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted-text)' }}>
                        No screening examinations recorded yet. Click "Upload Fundus" to start.
                      </td>
                    </tr>
                  ) : (
                    recentQueue.map((item) => (
                      <tr key={item.id} style={{ cursor: 'pointer' }} onClick={(e) => {
                        if (!e.target.closest('button')) navigate(`/analysis?id=${item.id}`);
                      }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={item.imageOriginal || item.image_path || item.imageUrl || '/demo/fundus_od_sample.jpg'}
                              alt="Fundus scan"
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #CBD5E1', flexShrink: 0 }}
                              onError={(e) => { e.target.src = '/demo/fundus_od_sample.jpg'; }}
                            />
                            <strong style={{ color: 'var(--primary-navy)' }}>{item.patientName || 'Unnamed Patient'}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="patient-id-tag">{item.patientId}</span>
                        </td>
                        <td>{formatDate(item.date || item.capturedAt)}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.prediction || item.primaryCondition}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-teal)' }}>
                            {formatConfidence(item.confidence || item.predictionConfidence)}
                          </span>
                        </td>
                        <td>
                          <StatusBadge level={item.status || item.riskLevel} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => navigate(`/analysis?id=${item.id}`)}
                            className="btn btn-outline btn-sm"
                            title="View AI Analysis"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Registered Patients Directory Table */
            <div className="clinical-table-wrapper" style={{ border: 'none' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient ID</th>
                    <th>Age / Gender</th>
                    <th>Diabetes Status</th>
                    <th>Phone / Contact</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted-text)' }}>
                        No registered patients. Click "New Patient" to add one.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong style={{ color: 'var(--primary-navy)' }}>{p.name}</strong>
                        </td>
                        <td>
                          <span className="patient-id-tag">{p.id}</span>
                        </td>
                        <td>{p.age} yrs &bull; {p.gender}</td>
                        <td>
                          <span className="badge badge-info">{p.diabetesStatus || 'Type 2 Diabetes'}</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {p.phone || '+91 98765 43210'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => setEditingPatient(p)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Patient Details"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingPatient(p)}
                              className="btn btn-secondary btn-sm"
                              title="Delete Patient Record"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                            <button
                              onClick={() => handleStartPatientScan(p)}
                              className="btn btn-primary btn-sm"
                              title="Start Fundus Screening Scan"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Play size={12} />
                              <span>Scan Fundus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Cohort Pathology Breakdown & Quick Model Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cohort Distribution Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <TrendingUp size={16} color="var(--primary-teal)" />
                  Screening Activity
                </div>
                <div className="card-subtitle">Pathology distribution across evaluated scans</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {distributionList.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--muted-text)', textAlign: 'center', padding: '16px 0' }}>
                  No screening activity logged yet.
                </div>
              ) : (
                distributionList.map((c) => (
                  <div key={c.name} style={{ cursor: 'pointer' }} onClick={() => navigate(`/history?disease=${encodeURIComponent(c.name)}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</span>
                      <span style={{ color: 'var(--muted-text)' }}>{c.count} cases ({c.pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(c.pct, 4)}%`, height: '100%', backgroundColor: c.color, borderRadius: 'var(--radius-pill)' }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Model Architecture Quick Specs */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Cpu size={16} color="var(--primary-teal)" />
                  Model Specification
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Architecture:</strong> EfficientNet-B3 + REFUGE U-Net</div>
              <div><strong>Validation Accuracy:</strong> <span style={{ color: 'var(--primary-teal)', fontWeight: 700 }}>81.78%</span></div>
              <div><strong>ROC-AUC (Macro):</strong> <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>0.941</span></div>
              <div><strong>Runtime Engine:</strong> PyTorch 2.5.1 CUDA 12.4</div>
            </div>

            <button onClick={() => navigate('/model')} className="btn btn-secondary btn-sm" style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}>
              <span>View Full Model Specifications</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={Boolean(editingPatient)}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSave={async (updated) => {
          saveLocalPatient(updated);
          await createPatient(updated).catch(() => {});
          setPatients((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
          if (showToast) showToast(`Updated patient ${updated.name}`, 'success');
        }}
      />

      {/* Delete Patient Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPatient)}
        title="Delete Registered Patient"
        message={`Are you sure you want to delete patient record '${deletingPatient?.name}' (${deletingPatient?.id})? This will remove the patient from the clinical directory.`}
        confirmText="Delete Patient"
        isDanger={true}
        onConfirm={async () => {
          if (!deletingPatient) return;
          try {
            await deletePatient(deletingPatient.id);
            setPatients((prev) => prev.filter((p) => p.id !== deletingPatient.id));
            if (showToast) showToast(`Deleted patient ${deletingPatient.name}`, 'success');
          } catch (err) {
            if (showToast) showToast(err.message || 'Failed to delete patient.', 'error');
          } finally {
            setDeletingPatient(null);
          }
        }}
        onCancel={() => setDeletingPatient(null)}
      />
    </div>
  );
}
