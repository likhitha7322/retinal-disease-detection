import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Search, Eye, Edit, Printer, Download, Trash2, ChevronLeft, ChevronRight, Filter, RefreshCw } from 'lucide-react';
import { getScreeningHistory, deleteScreening, updateScreeningPatientInfo } from '../services/screeningService';
import { formatDate, formatConfidence } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ConfirmDialog from '../components/ConfirmDialog';
import ClinicalReport from '../components/ClinicalReport';
import EditPatientModal from '../components/EditPatientModal';

import { exportScreeningToExcel, exportAllPatientsToExcel } from '../services/exportService';
import { saveLocalPatient, createPatient } from '../services/patientService';
import { useAppContext } from '../context/AppContext';

export default function ScreeningHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diseaseParam = searchParams.get('disease') || 'All';

  const { showToast } = useAppContext();

  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState(diseaseParam);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeReportRecord, setActiveReportRecord] = useState(null);
  const [editingRecordPatient, setEditingRecordPatient] = useState(null);
  const [exportingPatients, setExportingPatients] = useState(false);

  const handleExportPatients = async () => {
    setExportingPatients(true);
    try {
      const { getPatients, getLocalPatients } = await import('../services/patientService');

      // Source 1: backend API patients
      const apiPatients = await getPatients();

      // Source 2: localStorage patients (registered offline or not yet synced)
      const localPatients = getLocalPatients();

      // Source 3: unique patients extracted from screenings already in state
      // (catches patients who had a scan but were never formally registered)
      const screeningPatients = screenings
        .filter((s) => s.patientId || s.patientName)
        .map((s) => ({
          id:                 s.patientId || '',
          name:               s.patientName || 'Unnamed Patient',
          age:                s.age || '',
          gender:             s.gender || '',
          phone:              s.phone || '',
          diabetesStatus:     s.diabetesStatus || '',
          diabetesDuration:   s.diabetesDuration || '',
          bloodPressure:      s.bloodPressure || '',
          department:         s.department || '',
          referringClinician: s.referringClinician || '',
          visitDate:          s.capturedAt ? s.capturedAt.split('T')[0] : '',
          notes:              s.notes || '',
          created_at:         s.capturedAt || '',
        }));

      // Merge and deduplicate: prefer API data > local > screening-derived
      const seen = new Map();
      const allSources = [...apiPatients, ...localPatients, ...screeningPatients];

      allSources.forEach((p) => {
        // Build a stable key: use id when available, fall back to "name|age"
        const key = (p.id || '').trim() || `${(p.name || '').toLowerCase()}|${p.age}`;
        if (!key || key === '|') return; // skip completely empty records
        if (!seen.has(key)) {
          seen.set(key, p);
        } else {
          // Keep the richer record (more non-empty fields wins)
          const existing = seen.get(key);
          const existingScore = Object.values(existing).filter(Boolean).length;
          const newScore     = Object.values(p).filter(Boolean).length;
          if (newScore > existingScore) seen.set(key, p);
        }
      });

      const merged = Array.from(seen.values());
      exportAllPatientsToExcel(merged);
      showToast(`Exported ${merged.length} patient records to Excel.`, 'success');
    } catch (err) {
      showToast('Failed to export patient list: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setExportingPatients(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getScreeningHistory({
        search,
        disease: diseaseFilter === 'All' ? '' : diseaseFilter
      });
      setScreenings(data || []);
    } catch (err) {
      console.error('Failed to load screenings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [diseaseFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteScreening(deleteTarget.id);
      setScreenings((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      showToast(`Screening record ${deleteTarget.id} deleted.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Client side filtering
  const filtered = screenings.filter((s) => {
    const matchSearch =
      (s.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.patientId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'All' ||
      (s.riskLevel || s.status || '').toLowerCase().includes(statusFilter.toLowerCase());

    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Screening Examination Registry
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px' }}>
              Searchable historical database of vitreo-retinal scans &amp; diagnostic predictions
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-info">{filtered.length} Records Found</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExportPatients}
              disabled={exportingPatients}
              title="Download complete patient list as Excel file"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {exportingPatients ? (
                <RefreshCw size={13} className="spin" />
              ) : (
                <Download size={13} />
              )}
              <span>{exportingPatients ? 'Exporting…' : 'Export Patient List'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="history-filter-bar">
          <div className="history-search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by Patient Name, Patient ID, or Record ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--muted-text)" />
              <label style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Pathology:</label>
              <select value={diseaseFilter} onChange={(e) => setDiseaseFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="All">All Pathologies</option>
                <option value="Normal">Normal</option>
                <option value="Diabetic Retinopathy">Diabetic Retinopathy</option>
                <option value="Glaucoma">Glaucoma</option>
                <option value="AMD">AMD</option>
                <option value="Cataract">Cataract</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Risk Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="All">All Risk Tiers</option>
                <option value="High">High Risk</option>
                <option value="Moderate">Moderate / Priority</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingState message="Fetching screening registry database..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted-text)' }}>
            <History size={36} color="var(--border-hover)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-navy)' }}>No Screening Records Found</div>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search criteria or pathology filter.</p>
          </div>
        ) : (
          <>
            <div className="clinical-table-wrapper" style={{ border: 'none' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Patient ID</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                        {formatDate(s.capturedAt || s.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={s.imageOriginal || s.image_path || s.imageUrl || '/demo/fundus_od_sample.jpg'}
                            alt="Fundus scan"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #CBD5E1', flexShrink: 0 }}
                            onError={(e) => { e.target.src = '/demo/fundus_od_sample.jpg'; }}
                          />
                          <strong style={{ color: 'var(--primary-navy)' }}>{s.patientName || 'Unnamed Patient'}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="patient-id-tag">{s.patientId || s.id || 'PT-UNASSIGNED'}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.primaryCondition || s.disease}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-teal)' }}>
                          {formatConfidence(s.confidence || s.predictionConfidence)}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {s.severity || 'No Apparent Pathology'}
                      </td>
                      <td>
                        <StatusBadge level={s.riskLevel || s.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            onClick={() => navigate(`/analysis?id=${s.id}`)}
                            className="btn btn-outline btn-sm"
                            title="View AI Diagnostic Assessment"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingRecordPatient({ id: s.patientId || s.id, name: s.patientName || 'Unnamed Patient', age: s.age || 50, gender: s.gender || 'Male', recordId: s.id })}
                            className="btn btn-secondary btn-sm"
                            title="Edit Patient Details"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => setActiveReportRecord(s)}
                            className="btn btn-secondary btn-sm"
                            title="Print Clinical Report"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            onClick={() => exportScreeningToExcel(s, { id: s.patientId, name: s.patientName, age: s.age, gender: s.gender })}
                            className="btn btn-secondary btn-sm"
                            title="Export to Excel"
                          >
                            <Download size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="btn btn-danger btn-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <div>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} records
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <span style={{ padding: '0 8px', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Screening Record"
        message={`Are you sure you want to delete screening record ${deleteTarget?.id}? Associated fundus photographs will be permanently removed.`}
        confirmText="Delete Record"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Printable Clinical Report Modal */}
      {activeReportRecord && (
        <ClinicalReport
          screening={activeReportRecord}
          patient={{ id: activeReportRecord.patientId, name: activeReportRecord.patientName, age: activeReportRecord.age, gender: activeReportRecord.gender }}
          onClose={() => setActiveReportRecord(null)}
        />
      )}

      {/* Edit Patient Demographics Modal */}
      <EditPatientModal
        isOpen={Boolean(editingRecordPatient)}
        patient={editingRecordPatient}
        onClose={() => setEditingRecordPatient(null)}
        onSave={async (updated) => {
          const recId = editingRecordPatient?.recordId;
          saveLocalPatient(updated);
          await createPatient(updated).catch(() => {});
          setScreenings((prev) =>
            prev.map((item) =>
              item.id === recId || item.patientId === editingRecordPatient?.id
                ? { ...item, patientName: updated.name, patientId: updated.id, age: updated.age, gender: updated.gender }
                : item
            )
          );
          if (recId) {
            await updateScreeningPatientInfo(recId, updated);
          }
          showToast(`Updated record for patient ${updated.name}`, 'success');
        }}
      />
    </div>
  );
}

