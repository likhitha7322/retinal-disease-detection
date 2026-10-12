import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, X, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { DEMO_PRESET_SCANS } from '../utils/constants';
import { formatBytes } from '../utils/formatters';
import { validateImageFile } from '../utils/validation';

export default function ImageUploader({ selectedFile, previewUrl, onFileSelect, onSelectPreset, onClearImage, error }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageMeta, setImageMeta] = useState(null);

  const handleFile = (file) => {
    const val = validateImageFile(file);
    if (!val.isValid) {
      alert(val.error);
      return;
    }

    // Measure dimensions
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.width,
        height: img.height,
        size: file.size,
        name: file.name
      });
    };
    img.src = URL.createObjectURL(file);

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <UploadCloud size={18} color="var(--primary-teal)" />
            Fundus Image Acquisition
          </div>
          <div className="card-subtitle">
            Upload a 45° or 50° dilated color retinal photograph (JPG, JPEG, PNG up to 25MB)
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div
        className={`uploader-dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div>
            <img
              src={previewUrl}
              alt="Fundus preview"
              className="uploader-preview-img"
            />
            <div className="uploader-file-meta">
              <span style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>
                {selectedFile ? selectedFile.name : 'Clinical Preset Selected'}
              </span>
              {imageMeta && (
                <span>&bull; {imageMeta.width}x{imageMeta.height} px &bull; {formatBytes(imageMeta.size)}</span>
              )}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={13} />
                <span>Replace Image</span>
              </button>
              {onClearImage && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClearImage(); setImageMeta(null); }}
                  className="btn btn-danger btn-sm"
                >
                  <X size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <UploadCloud size={44} color="var(--primary-teal)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-navy)' }}>
              Drag &amp; drop color fundus image here
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '4px' }}>
              or click to browse from local workstation storage
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '12px', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Clinical Verified Presets */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted-text)', marginBottom: '8px' }}>
          Or Select Verified Clinical Preset Scans
        </div>
        <div className="demo-preset-grid">
          {DEMO_PRESET_SCANS.map((preset) => {
            const isSelected = previewUrl === preset.path;
            return (
              <div
                key={preset.label}
                className={`demo-preset-card ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setImageMeta(null);
                  onSelectPreset(preset);
                }}
              >
                <strong>{preset.label}</strong>
                <span>{preset.category}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

