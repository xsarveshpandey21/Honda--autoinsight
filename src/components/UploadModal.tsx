import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { loadCSVFile, loadSampleData, isLoading, error } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }
    await loadCSVFile(file);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <UploadCloud size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Upload Honda Sales CSV</h3>
            <p className="text-xs text-slate-400">100% Client-Side Parsing. No Server, No API Keys.</p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-red-500 bg-red-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800 text-red-500 flex items-center justify-center border border-slate-700 shadow-inner">
            <FileText size={28} />
          </div>
          <p className="text-sm font-semibold text-slate-200 mb-1">
            Click to upload or drag & drop CSV file
          </p>
          <p className="text-xs text-slate-400">
            Supports standard schema (Year, Make, Model, Price, Mileage, Ratings, VIN, etc.)
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={async () => {
              await loadSampleData();
              onClose();
            }}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles size={14} />
            <span>Reset to Sample Honda Dataset</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
