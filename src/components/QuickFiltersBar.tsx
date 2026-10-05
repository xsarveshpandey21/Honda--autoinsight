import React, { useMemo } from 'react';
import { Filter, RotateCcw, X, ChevronDown, Check } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { CarCondition } from '../types';

export const QuickFiltersBar: React.FC = () => {
  const { filters, setFilters, resetFilters, cleanedDataset } = useDataStore();

  // Extract unique base models, conditions, fuel types, states from dataset
  const availableModels = useMemo(() => {
    const set = new Set<string>();
    cleanedDataset.forEach(d => { if (d.baseModel) set.add(d.baseModel); });
    return Array.from(set).sort();
  }, [cleanedDataset]);

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    cleanedDataset.forEach(d => { if (d.state) set.add(d.state); });
    return Array.from(set).sort();
  }, [cleanedDataset]);

  const conditions: CarCondition[] = ['New', 'Used', 'Certified'];

  const toggleModel = (model: string) => {
    const current = filters.selectedModels;
    if (current.includes(model)) {
      setFilters({ selectedModels: current.filter(m => m !== model) });
    } else {
      setFilters({ selectedModels: [...current, model] });
    }
  };

  const toggleCondition = (cond: CarCondition) => {
    const current = filters.selectedConditions;
    if (current.includes(cond)) {
      setFilters({ selectedConditions: current.filter(c => c !== cond) });
    } else {
      setFilters({ selectedConditions: [...current, cond] });
    }
  };

  const activeFilterCount = 
    filters.selectedModels.length + 
    filters.selectedConditions.length + 
    filters.selectedStates.length + 
    (filters.minConsumerRating > 0 ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <Filter size={16} />
          </div>
          <span className="font-bold text-sm text-slate-100">Global Dataset Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Model Filter Pills */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1.5">Model</label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-800/50 rounded-xl border border-slate-800">
            {availableModels.map((m) => {
              const isSelected = filters.selectedModels.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleModel(m)}
                  className={`px-2 py-1 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1.5">Condition</label>
          <div className="flex gap-1.5">
            {conditions.map((c) => {
              const isSelected = filters.selectedConditions.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={`flex-1 py-2 rounded-xl font-semibold transition-all border text-center ${
                    isSelected
                      ? 'bg-red-600/20 text-red-300 border-red-500/50'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimum Consumer Rating */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1.5">
            Min Consumer Rating: {filters.minConsumerRating > 0 ? `${filters.minConsumerRating} Stars` : 'Any'}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minConsumerRating}
            onChange={(e) => setFilters({ minConsumerRating: parseFloat(e.target.value) })}
            className="w-full accent-red-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-2"
          />
        </div>

        {/* State Selector */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1.5">State Location</label>
          <select
            value={filters.selectedStates[0] || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFilters({ selectedStates: val ? [val] : [] });
            }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">All States ({availableStates.length})</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
