import { useCallback, useState, useEffect } from 'react';
import api from '../api';

export default function FileUpload({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Simulate upload progress for nice visual feedback
  useEffect(() => {
    let interval;
    if (uploading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 250);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [uploading]);

  const uploadFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or image (JPG, PNG, WebP).');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('document', file);
      const { data } = await api.post('/bookings/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProgress(100);
      setTimeout(() => {
        onUploaded?.(data);
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    },
    [onUploaded]
  );

  return (
    <div>
      <div
        className={`dropzone ${dragging ? 'active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && document.getElementById('file-input')?.click()}
        style={{ pointerEvents: uploading ? 'none' : 'auto' }}
      >
        <div className="dropzone-icon">
          {uploading ? '⚡' : dragging ? '📥' : '✈️'}
        </div>
        <strong>{uploading ? 'Processing documents with AI...' : dragging ? 'Drop to upload!' : 'Drop travel documents here'}</strong>
        <p style={{ margin: '0.5rem 0 1rem' }}>
          Flights, hotels, train passes — PDF or images (up to 10MB)
        </p>

        {uploading ? (
          <div style={{ width: '80%', margin: '0 auto' }}>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '0.5rem' }}>
              Reading files and extracting metadata...
            </span>
          </div>
        ) : (
          <span 
            style={{ 
              fontSize: '0.8rem', 
              color: 'var(--accent)', 
              fontWeight: 600,
              padding: '0.4rem 0.8rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }}
          >
            Browse files
          </span>
        )}

        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*"
          hidden
          onChange={(e) => uploadFile(e.target.files[0])}
        />
      </div>
      {error && <p className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</p>}
    </div>
  );
}
