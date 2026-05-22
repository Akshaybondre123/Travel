import { useCallback, useState } from 'react';
import api from '../api';

export default function FileUpload({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
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
      onUploaded?.(data);
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
        onClick={() => document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
      >
        <div style={{ fontSize: '2rem' }}>✈️</div>
        <strong>{uploading ? 'Uploading…' : 'Drop travel documents here'}</strong>
        <p>Flight tickets, hotel bookings, train passes — PDF or images up to 10MB</p>
        <input
          id="file-input"
          type="file"
          accept=".pdf,image/*,.txt"
          hidden
          onChange={(e) => uploadFile(e.target.files[0])}
        />
      </div>
      {error && <p className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</p>}
    </div>
  );
}
