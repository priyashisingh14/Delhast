import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, CheckCircle2, X, AlertCircle } from 'lucide-react';

export const IDCardUploader = ({
  file,
  onFileSelect,
  onFileRemove,
  error,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (selectedFile) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      alert('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }
    onFileSelect(selectedFile);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Student ID Card Image
        </label>
        <span className="text-[11px] text-slate-400">JPG, PNG ≤ 5MB</span>
      </div>

      {!file ? (
        /* Empty Drag & Drop State */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50'
              : error
              ? 'border-rose-300 bg-rose-50/50 hover:border-rose-400'
              : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 border border-indigo-100 shadow-2xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Upload Student ID Card
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click to browse or drag & drop photo
          </p>
        </div>
      ) : (
        /* Uploaded State with Thumbnail & Remove Button */
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 transition-all animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail Preview */}
            <div className="w-11 h-11 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden shrink-0 relative flex items-center justify-center">
              {file instanceof File ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="ID Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileImage className="w-5 h-5 text-slate-500" />
              )}
            </div>

            {/* File Info */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {file.name || 'student_id.jpg'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onFileRemove}
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            title="Remove ID Card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
