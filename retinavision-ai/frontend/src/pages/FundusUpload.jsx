import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PatientSummary from '../components/PatientSummary';
import ImageUploader from '../components/ImageUploader';
import QualityChecklist from '../components/QualityChecklist';
import AnalysisProgress from '../components/AnalysisProgress';
import { uploadFundusAndAnalyze } from '../services/screeningService';

export default function FundusUpload() {
  const navigate = useNavigate();
  const {
    currentPatient,
    uploadedImage,
    setUploadedImage,
    uploadedFile,
    setUploadedFile,
    selectedEye,
    setSelectedEye,
    setAnalysisResult,
    settings,
    showToast
  } = useAppContext();

  const [analyzing, setAnalyzing] = useState(false);
  const [stepName, setStepName] = useState('Uploading Image');
  const [progressPercent, setProgressPercent] = useState(0);
  const [gateRejection, setGateRejection] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Quality gate state simulation/live checks
  const [gatePassed, setGatePassed] = useState(true);
  const [qualityScore, setQualityScore] = useState(0.92);

  const handleFileSelect = (file) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);
    setGateRejection(null);
    setErrorMsg(null);
    setGatePassed(true);
    setQualityScore(0.92);
  };

  const handleSelectPreset = (preset) => {
    setUploadedFile(null);
    setUploadedImage(preset.path);
    setSelectedEye(preset.eye);
    setGateRejection(null);
    setErrorMsg(null);
    setGatePassed(true);
    setQualityScore(0.92);
  };

  const handleClearImage = () => {
    setUploadedFile(null);
    setUploadedImage(null);
    setGateRejection(null);
    setErrorMsg(null);
  };

  const handleRunAnalysis = async () => {
    if (!uploadedImage && !uploadedFile) {
      showToast('Please select or upload a fundus photograph first.', 'error');
      return;
    }

    setAnalyzing(true);
    setGateRejection(null);
    setErrorMsg(null);

    // Multi-step progress animation
    setStepName('Uploading Image to Backend');
    setProgressPercent(20);

    setTimeout(() => {
      setStepName('Checking Image Quality Gate');
      setProgressPercent(45);
    }, 400);

    setTimeout(() => {
      setStepName('Running PyTorch EfficientNet-B3 Model');
      setProgressPercent(70);
    }, 900);

    setTimeout(() => {
      setStepName('Generating Grad-CAM++ Explanation');
      setProgressPercent(90);
    }, 1400);

    try {
      const res = await uploadFundusAndAnalyze({
        file: uploadedFile,
        imageUrl: uploadedFile ? null : uploadedImage,
        patient: currentPatient,
        eye: selectedEye
      });

      if (res && res.rejected) {
        setGatePassed(false);
        setQualityScore(0.35);
        setGateRejection(res);
        setAnalyzing(false);
        showToast('Image quality check failed.', 'error');
        return;
      }

      setStepName('Analysis Complete');
      setProgressPercent(100);

      setTimeout(() => {
        setAnalysisResult(res);
        setAnalyzing(false);
        showToast('Neural screening inference completed successfully.', 'success');
        navigate('/analysis');
      }, 400);


    } catch (err) {
      setAnalyzing(false);
      setErrorMsg(err.message || 'Failed to complete AI screening.');
      showToast(err.message || 'Inference error occurred.', 'error');
    }
  };

  const canRun = Boolean(uploadedImage || uploadedFile) && (!settings.requireQualityGate || gatePassed);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Patient Summary Bar */}
      <PatientSummary
        patient={currentPatient}
        selectedEye={selectedEye}
        onEyeChange={setSelectedEye}
        showActions={true}
      />

      {/* Quality Rejection Banner */}
      {gateRejection && (
        <div className="rejection-alert-card fade-in">
          <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Quality Gate Rejection: {gateRejection.reason}</strong>
            <p>{gateRejection.disclaimer}</p>
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--danger)', fontWeight: 600 }}>
              Physiological checks failed: {gateRejection.failedCheck}. Please acquire and upload a clearer, properly illuminated fundus photograph.
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="rejection-alert-card fade-in" style={{ backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' }}>
          <AlertTriangle size={24} color="var(--danger)" />
          <div>
            <strong style={{ color: 'var(--danger)' }}>System Connection Notice</strong>
            <p style={{ color: '#9B2C2C' }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* AI Processing Progress View */}
      {analyzing ? (
        <AnalysisProgress stepName={stepName} percent={progressPercent} />
      ) : (
        /* Main Two-Column Upload Layout */
        <div className="upload-layout-grid">
          {/* Left Column: Image Acquisition */}
          <ImageUploader
            selectedFile={uploadedFile}
            previewUrl={uploadedImage}
            onFileSelect={handleFileSelect}
            onSelectPreset={handleSelectPreset}
            onClearImage={handleClearImage}
          />

          {/* Right Column: Quality Checklist & Execute Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <QualityChecklist
              gatePassed={gatePassed}
              qualityScore={qualityScore}
            />

            {/* Execute AI Screening Action Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Brain size={18} color="var(--primary-teal)" />
                    Execute AI Diagnostic Screening
                  </div>
                  <div className="card-subtitle">
                    Run PyTorch neural network classification &amp; XAI explanation
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                Once verified, click below to compute 5-class pathology probabilities, DR severity stage, optic cupping ratio, and Grad-CAM++ saliency overlays.
              </p>

              <button
                onClick={handleRunAnalysis}
                disabled={!canRun}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Brain size={18} />
                <span>Run AI Screening</span>
                <ArrowRight size={16} />
              </button>

              {!gatePassed && settings.requireQualityGate && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--danger)', textAlign: 'center', fontWeight: 600 }}>
                  Quality Gate required before classification. Upload a clearer fundus scan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
