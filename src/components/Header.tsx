import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Filter,
  Sparkles
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenQualityReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload, onOpenQualityReport }) => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    cleanedDataset, 
    filteredDataset,
    datasetName, 
    qualityReport,
    hasSimulatedDate,
    toggleSimulateDateColumn,
    loadSampleData
  } = useDataStore();

  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setFilters({ searchQuery: val });
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search by Model, VIN, Trim, Year, State..."
            className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setFilters({ searchQuery: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs bg-slate-700 rounded-full px-1.5 py-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Dataset & Quick Controls */}
      <div className="flex items-center space-x-3">
        {/* Dataset Pill & Quality Status */}
        <div 
          onClick={onOpenQualityReport}
          className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center space-x-2 text-xs text-slate-300"
          title="Click to view Data Quality Report"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium truncate max-w-[140px]">{datasetName}</span>
          <span className="text-slate-400 font-mono">({filteredDataset.length}/{cleanedDataset.length})</span>
          {qualityReport?.dateColumnDetected ? (
            <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Calendar size={12} />
              <span>Date Detected</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Info size={12} />
              <span>No Date Col</span>
            </span>
          )}
        </div>

        {/* Currency Switcher Pill (₹ INR vs $ USD) */}
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => useDataStore.getState().setCurrencyMode('INR')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              useDataStore.getState().currencyMode === 'INR'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Display prices in Indian Rupees (₹)"
          >
            ₹ INR
          </button>
          <button
            onClick={() => useDataStore.getState().setCurrencyMode('USD')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              useDataStore.getState().currencyMode === 'USD'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Display prices in US Dollars ($)"
          >
            $ USD
          </button>
        </div>

        {/* Simulate Date Column Button (to test monthly sales) */}
        <button
          onClick={toggleSimulateDateColumn}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
            hasSimulatedDate
              ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title={hasSimulatedDate ? 'Disable Date Simulation' : 'Enable Simulated Date Column for Monthly Sales'}
        >
          <Sparkles size={14} className={hasSimulatedDate ? 'text-purple-400' : 'text-slate-400'} />
          <span>{hasSimulatedDate ? 'Sim Date Active' : '+ Sim Date'}</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold text-xs shadow-md shadow-red-900/30 flex items-center space-x-1.5 transition-all"
        >
          <Upload size={14} />
          <span>Upload CSV</span>
        </button>

        {/* Reset Filters Button */}
        <button
          onClick={resetFilters}
          className="p-2 bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          title="Reset All Filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
};
