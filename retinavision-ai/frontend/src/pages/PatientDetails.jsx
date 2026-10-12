import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createPatient } from '../services/patientService';
import { validatePatientForm } from '../utils/validation';

export default function PatientDetails() {
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient, showToast } = useAppContext();

  const [formData, setFormData] = useState({
    id: currentPatient?.id || `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: currentPatient?.name || '',
    age: currentPatient?.age || '',
    gender: currentPatient?.gender || 'Male',
    phone: currentPatient?.phone || '',
    diabetesStatus: currentPatient?.diabetesStatus || 'Type 2 Diabetes',
    diabetesDuration: currentPatient?.diabetesDuration || '5 years',
    bloodPressure: currentPatient?.bloodPressure || '120/80 mmHg',
    department: currentPatient?.department || 'Ophthalmology / Vitreo-Retina',
    referringClinician: currentPatient?.referringClinician || 'Dr. Anand Verma',
    visitDate: currentPatient?.visitDate || new Date().toISOString().split('T')[0],
    notes: currentPatient?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const val = validatePatientForm(formData);
    if (!val.isValid) {
      setErrors(val.errors);
      showToast('Please correct form validation errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await createPatient(formData);
      setCurrentPatient(created);
      showToast(`Patient ${created.name} (${created.id}) registered successfully.`, 'success');
      setTimeout(() => {
        navigate('/upload');
      }, 500);
    } catch (err) {
      showToast(err.message || 'Failed to register patient.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <UserRound size={20} color="var(--primary-teal)" />
              Ophthalmic Patient Intake &amp; Clinical Registration
            </div>
            <div className="card-subtitle">
              Enter patient demographics, diabetic history, and referring clinical information
            </div>
          </div>
          <span className="badge badge-info">Step 1 of 3</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2col">
            {/* Patient ID */}
            <div>
              <label>
                Patient Registration ID <span className="form-field-req">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                required
              />
            </div>

            {/* Patient Name */}
            <div>
              <label>
                Full Patient Name <span className="form-field-req">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rajesh Sharma"
                required
              />
              {errors.name && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '3px' }}>{errors.name}</div>}
            </div>

            {/* Age */}
            <div>
              <label>
                Age (Years) <span className="form-field-req">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 58"
                min="1"
                max="120"
                required
              />
              {errors.age && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '3px' }}>{errors.age}</div>}
            </div>

            {/* Gender */}
            <div>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label>Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '3px' }}>{errors.phone}</div>}
            </div>

            {/* Diabetes Status */}
            <div>
              <label>Diabetes Status</label>
              <select name="diabetesStatus" value={formData.diabetesStatus} onChange={handleChange}>
                <option value="None">No Diabetes</option>
                <option value="Pre-diabetic">Pre-diabetic</option>
                <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                <option value="Gestational Diabetes">Gestational Diabetes</option>
              </select>
            </div>

            {/* Diabetes Duration */}
            <div>
              <label>Diabetes Duration</label>
              <input
                type="text"
                name="diabetesDuration"
                value={formData.diabetesDuration}
                onChange={handleChange}
                placeholder="e.g. 7 years"
              />
            </div>

            {/* Blood Pressure */}
            <div>
              <label>Blood Pressure (Systemic)</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="e.g. 138/88 mmHg"
              />
            </div>

            {/* Department */}
            <div>
              <label>Department / Unit</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            {/* Referring Clinician */}
            <div>
              <label>Referring Clinician</label>
              <input
                type="text"
                name="referringClinician"
                value={formData.referringClinician}
                onChange={handleChange}
              />
            </div>

            {/* Visit Date */}
            <div>
              <label>Screening Visit Date</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="form-full-width">
              <label>Presenting Complaints &amp; Clinical Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Blurred vision, floaters, metamorphopsia, HbA1c levels, prior laser photocoagulation..."
              />
            </div>
          </div>

          <div className="form-actions-bar">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Saving Patient...</span>
                </>
              ) : (
                <>
                  <span>Save Patient &amp; Continue</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
