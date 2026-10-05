import React from 'react';
import { ShieldCheck, AlertCircle, FileCheck, Layers, Calendar, X, Hash } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

interface DataQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataQualityModal: React.FC<DataQualityModalProps> = ({ isOpen, onClose }) => {
  const { qualityReport, datasetName } = useDataStore();

  if (!isOpen || !qualityReport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Data Quality & Health Report</h3>
            <p className="text-xs text-slate-400">Dataset: {datasetName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Raw Rows</span>
              <Layers size={14} />
            </div>
            <div className="text-xl font-bold text-slate-100">{qualityReport.totalLoadedRows.toLocaleString()}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Valid Listings</span>
              <FileCheck size={14} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">{qualityReport.validRowsCount.toLocaleString()}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Duplicate VINs Filtered</span>
              <Hash size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400">{qualityReport.duplicateVinsRemoved.toLocaleString()}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Missing Prices</span>
              <AlertCircle size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-200">{qualityReport.missingPriceCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Date Column Status Card */}
        <div className={`p-4 rounded-xl border mb-6 ${
          qualityReport.dateColumnDetected 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2.5 font-semibold text-sm mb-1">
            <Calendar size={16} />
            <span>Date Column Status</span>
          </div>
          {qualityReport.dateColumnDetected ? (
            <p className="text-xs leading-relaxed text-emerald-400/90">
              Detected column <code className="bg-emerald-900/50 px-1.5 py-0.5 rounded font-mono text-emerald-200">{qualityReport.dateColumnName}</code>. Monthly sales trends are enabled!
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-amber-400/90">
              No sale date column found in dataset. "Year" column represents car model year. You can click "+ Sim Date" in header to test monthly charts.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors border border-slate-700"
        >
          Close Report
        </button>
      </div>
    </div>
  );
};
