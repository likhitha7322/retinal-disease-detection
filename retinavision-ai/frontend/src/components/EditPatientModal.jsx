import React, { useState, useEffect } from 'react';
import { User, X, Save, CheckCircle } from 'lucide-react';

export default function EditPatientModal({ isOpen, patient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    age: '',
    gender: 'Male',
    phone: '',
    diabetesStatus: 'Type 2 Diabetes',
    diabetesDuration: '5 years',
    bloodPressure: '120/80 mmHg',
    notes: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        id: patient.id || '',
        age: patient.age || '',
        gender: patient.gender || 'Male',
        phone: patient.phone || '',
        diabetesStatus: patient.diabetesStatus || 'Type 2 Diabetes',
        diabetesDuration: patient.diabetesDuration || '5 years',
        bloodPressure: patient.bloodPressure || '120/80 mmHg',
        notes: patient.notes || ''
      });
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const updatedPatient = {
      ...patient,
      ...formData,
      age: parseInt(formData.age, 10) || patient?.age || 50
    };

    onSave(updatedPatient);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: '580px', width: '90%' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ backgroundColor: 'var(--primary-navy)', color: '#FFFFFF', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px', borderRadius: '6px' }}>
              <User size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Edit Patient Intake Information</h3>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                Update clinical demographic records and medical history
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            
            {/* Name & ID Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Rajesh Sharma"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Patient ID / MRN
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g. PT-2026-0841"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Age, Gender & Phone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Age (Years) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="120"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Diabetes & Blood Pressure Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Diabetes Status
                </label>
                <select
                  name="diabetesStatus"
                  value={formData.diabetesStatus}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                  <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                  <option value="Pre-Diabetic">Pre-Diabetic</option>
                  <option value="Non-Diabetic">Non-Diabetic</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Duration
                </label>
                <input
                  type="text"
                  name="diabetesDuration"
                  value={formData.diabetesDuration}
                  onChange={handleChange}
                  placeholder="e.g. 7 years"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  placeholder="120/80 mmHg"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Clinical Notes */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1E293B', marginBottom: '4px', fontSize: '12px' }}>
                Clinical Remarks &amp; Symptoms
              </label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Visual fatigue, blurred vision, hypertension history..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={14} />
              <span>Save Patient Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
