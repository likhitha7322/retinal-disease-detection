import React, { useState } from 'react';
import { User, Eye, Edit, UserCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import EditPatientModal from './EditPatientModal';
import { updateScreeningPatientInfo } from '../services/screeningService';
import { saveLocalPatient, createPatient } from '../services/patientService';

export default function PatientSummary({ patient, selectedEye, onEyeChange, showActions = true }) {
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient, analysisResult, setAnalysisResult, showToast } = useAppContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activePatient = patient || currentPatient;

  const handleSavePatient = async (updatedPatient) => {
    setCurrentPatient(updatedPatient);
    saveLocalPatient(updatedPatient);
    createPatient(updatedPatient).catch(() => {});

    // Sync updated patient info to active analysisResult
    if (analysisResult) {
      setAnalysisResult({
        ...analysisResult,
        patientName: updatedPatient.name,
        patientId: updatedPatient.id,
        age: updatedPatient.age,
        gender: updatedPatient.gender
      });

      if (analysisResult.id) {
        await updateScreeningPatientInfo(analysisResult.id, updatedPatient);
      }
    }

    if (showToast) {
      showToast(`Updated details for patient ${updatedPatient.name}`, 'success');
    }
  };


  if (!activePatient) {
    return (
      <div className="patient-summary-strip">
        <div className="patient-summary-main">
          <div className="patient-avatar-box">
            <User size={20} />
          </div>
          <div>
            <div className="patient-info-title">
              <h3>No Patient Selected</h3>
            </div>
            <div className="patient-meta-text">Please register or select a patient to start fundus screening.</div>
          </div>
        </div>
        {showActions && (
          <button onClick={() => navigate('/patient')} className="btn btn-primary btn-sm">
            <span>Register Patient</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="patient-summary-strip">
        <div className="patient-summary-main">
          <div className="patient-avatar-box">
            <User size={20} />
          </div>
          <div>
            <div className="patient-info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3>{activePatient.name || 'Unnamed Patient'}</h3>
              <span className="patient-id-tag">{activePatient.id || 'PT-UNASSIGNED'}</span>
            </div>
            <div className="patient-meta-text">
              {activePatient.age} yrs &bull; {activePatient.gender || 'Male'} &bull; {activePatient.diabetesStatus || 'Type 2 Diabetes'} ({activePatient.diabetesDuration || '7 yrs'})
              {activePatient.phone ? ` • Tel: ${activePatient.phone}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Exam Eye Selector */}
          {onEyeChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Exam Eye:
              </label>
              <select
                value={selectedEye || 'OD (Right Eye)'}
                onChange={(e) => onEyeChange(e.target.value)}
                style={{ width: 'auto', padding: '5px 10px', fontSize: '12.5px', fontWeight: 600 }}
              >
                <option value="OD (Right Eye)">OD (Right Eye)</option>
                <option value="OS (Left Eye)">OS (Left Eye)</option>
              </select>
            </div>
          )}

          {showActions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-secondary btn-sm"
                title="Edit patient intake details"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Edit size={13} />
                <span>Edit Patient</span>
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="btn btn-outline btn-sm"
                title="Switch to another patient"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                <UserCheck size={13} />
                <span>Switch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Patient Inline Modal */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        patient={activePatient}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePatient}
      />
    </>
  );
}

