import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, User, Mail, Lock, Building2, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useAppContext();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Ophthalmologist',
    department: 'Vitreo-Retinal Diagnostic Unit',
    hospitalName: 'Apex Eye Institute',
    licenseNo: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await register(formData);
      showToast(`Welcome Dr. ${formData.fullName}! Profile registered successfully.`, 'success');
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register account.');
      showToast('Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B2438',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#12304A',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#FFFFFF'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#138F98',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              Clinician Account Registration
            </h1>
            <p style={{ fontSize: '11.5px', color: '#9AB0C2', marginTop: '1px' }}>
              Register specialist credentials for RetinaVision AI Workstation
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FDF2F3',
                border: '1px solid rgba(195, 62, 73, 0.3)',
                color: '#C33E49',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '18px'
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Full Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Clinician Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Dr. Ananya Sen"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Email Address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ananya.sen@hospital.org"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Clinical Role
              </label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Vitreo-Retinal Specialist">Vitreo-Retinal Specialist</option>
                <option value="Optometrist">Optometrist</option>
                <option value="Resident Physician">Resident Physician</option>
              </select>
            </div>

            {/* License No */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Medical License / Reg No.
              </label>
              <input
                type="text"
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                placeholder="e.g. KMC-881920"
              />
            </div>

            {/* Hospital Name */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Hospital / Institution
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="e.g. Apex Eye Institute"
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334D64', marginBottom: '4px', display: 'block' }}>
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Ophthalmology"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
          >
            <span>{submitting ? 'Registering Account...' : 'Register Specialist Account'}</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '12px', color: '#71808C' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#138F98' }}>
              Sign In &rarr;
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

