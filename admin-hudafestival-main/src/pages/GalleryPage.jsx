import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect, useRef } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import api from '../services/api';
import { Upload, X, Trash2, Image as ImageIcon } from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const GalleryPage = () => {
  const alertAction = useAlert();

  const confirmAction = useConfirm();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [day, setDay] = useState('');
  
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setImages(res.data);
    } catch (err) {
      setError('Failed to fetch gallery images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alertAction('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alertAction('Image must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setDay('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (caption) formData.append('caption', caption);
    if (day) formData.append('day', day);

    try {
      await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Image uploaded successfully!');
      handleClearForm();
      fetchImages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction('Confirm', 'Are you sure you want to delete this image?');
    if (!confirmed) return;
    
    try {
      await api.delete(`/gallery/${id}`);
      setImages(images.filter(img => img._id !== id));
      setSuccess('Image deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Gallery Management</h1>
        <p className="text-sm text-[var(--color-text-body)] mt-1">Upload images to the public gallery, add captions, and organize by day.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-800/40 text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-900/20 border border-green-800/40 text-green-400 rounded-lg text-sm">{success}</div>}

      {/* Upload Form */}
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Upload New Image</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">Image File</label>
            {!previewUrl ? (
              <div 
                className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm font-medium text-[var(--color-text-heading)]">Click to browse or drag and drop</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, JPEG up to 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-black/10 aspect-video flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                <button 
                  type="button"
                  onClick={handleClearForm}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Caption (Optional)</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Enter a caption for this image..."
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] resize-none h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Day/Category Label (Optional)</label>
              <select value={day} onChange={e => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)]">
                <option value="">Select day…</option>
                <option value="Day 1">Day 1</option>
                <option value="Day 2">Day 2</option>
                <option value="Day 3">Day 3</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full" disabled={!selectedFile || uploading} loading={uploading}>
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Grid of Images */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
          <ImageIcon size={20} className="text-[var(--color-text-muted)]" />
          Gallery Library
        </h2>
        
        {loading ? (
          <p className="text-[var(--color-text-muted)]">Loading gallery...</p>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(img => (
              <div key={img._id} className="group relative bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm hover:border-[var(--color-primary)] transition-all">
                <div className="aspect-video bg-black/5 overflow-hidden">
                  <img 
                    src={img.url} 
                    alt={img.caption || 'Gallery Image'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  {img.day && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-2">
                      {img.day}
                    </span>
                  )}
                  <p className="text-sm text-[var(--color-text-heading)] line-clamp-2">
                    {img.caption || <span className="text-[var(--color-text-muted)] italic">No caption</span>}
                  </p>
                </div>
                
                {/* Delete overlay button */}
                <button 
                  onClick={() => handleDelete(img._id)}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={ImageIcon}
            title="No images yet" 
            description="Upload some images to start building your gallery." 
          />
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
