import React, { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Star, 
  GitCompare, 
  Check, 
  Zap, 
  Gauge, 
  Fuel, 
  ArrowUpDown,
  Car
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { QuickFiltersBar } from '../components/QuickFiltersBar';
import { getModelImagePath, getModelColors } from '../utils/carImages';
import { formatCurrency } from '../utils/currency';
import type { CleanedCarRecord } from '../types';

export const CataloguePage: React.FC = () => {
  const { filteredDataset, setSelectedCarForModal, compareCarIds, toggleCompareCar, currencyMode } = useDataStore();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortField, setSortField] = useState<'price' | 'year' | 'mileage' | 'valueScore' | 'rating'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorted Dataset
  const sortedData = React.useMemo(() => {
    return [...filteredDataset].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'price') { valA = a.price ?? 0; valB = b.price ?? 0; }
      else if (sortField === 'year') { valA = a.year; valB = b.year; }
      else if (sortField === 'mileage') { valA = a.mileage ?? 0; valB = b.mileage ?? 0; }
      else if (sortField === 'valueScore') { valA = a.valueScore ?? 0; valB = b.valueScore ?? 0; }
      else if (sortField === 'rating') { valA = a.consumerRating ?? 0; valB = b.consumerRating ?? 0; }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDataset, sortField, sortOrder]);

  // Virtualizer setup for 60fps scrolling over 5,000+ items
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Estimated height per table row
    overscan: 15,
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <QuickFiltersBar />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="font-bold text-slate-100 text-sm">{sortedData.length.toLocaleString()} Vehicles Found</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Virtualized Catalogue Engine</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700">
            <ArrowUpDown size={14} className="text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="price">Price</option>
              <option value="year">Model Year</option>
              <option value="mileage">Mileage</option>
              <option value="valueScore">Value Score</option>
              <option value="rating">Rating</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-1.5 py-0.5 text-slate-300 hover:text-white font-bold"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>

          {/* Grid vs Table View Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
                viewMode === 'table' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List size={16} />
              <span>Virtualized Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid size={16} />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIRTUALIZED TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-800/90 text-slate-400 font-semibold text-xs uppercase px-4 py-3 border-b border-slate-700 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1">Compare</div>
            <div className="col-span-3 cursor-pointer" onClick={() => handleSort('year')}>Vehicle / Model</div>
            <div className="col-span-1">Cond</div>
            <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('price')}>Price</div>
            <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('mileage')}>Mileage</div>
            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('rating')}>Rating</div>
            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('valueScore')}>Score</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Scrollable Container for Virtualizer */}
          <div ref={parentRef} className="h-[600px] overflow-auto relative">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const car = sortedData[virtualRow.index];
                const isCompared = compareCarIds.includes(car.id);
                const colors = getModelColors(car.baseModel);

                return (
                  <div
                    key={car.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-4 py-2 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors grid grid-cols-12 gap-2 items-center text-xs text-slate-300"
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => toggleCompareCar(car.id)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="col-span-3 font-bold text-slate-100 truncate flex items-center space-x-2">
                      <span>{car.year} {car.make} {car.model}</span>
                    </div>

                    <div className="col-span-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.badge}`}>
                        {car.condition}
                      </span>
                    </div>

                    <div className="col-span-2 text-right font-extrabold text-emerald-400 font-mono">
                      {formatCurrency(car.price, currencyMode)}
                    </div>

                    <div className="col-span-2 text-right text-slate-300 font-mono">
                      {car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}
                    </div>

                    <div className="col-span-1 text-center font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Star size={12} fill="#F59E0B" /> {car.consumerRating || 'N/A'}
                    </div>

                    <div className="col-span-1 text-center font-bold text-purple-400 font-mono">
                      {car.valueScore || 'N/A'}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => setSelectedCarForModal(car)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-[11px] border border-slate-700"
                      >
                        Specs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CARDS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedData.slice(0, 100).map((car) => {
            const imagePath = getModelImagePath(car.baseModel);
            const colors = getModelColors(car.baseModel);
            const isCompared = compareCarIds.includes(car.id);

            return (
              <div
                key={car.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-red-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Compare Toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                      {car.condition}
                    </span>
                    <button
                      onClick={() => toggleCompareCar(car.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border ${
                        isCompared
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <GitCompare size={14} />
                    </button>
                  </div>

                  {/* Title & Price */}
                  <h4 className="text-base font-bold text-slate-100 truncate">
                    {car.year} {car.make} {car.model}
                  </h4>
                  <div className="text-xl font-extrabold text-emerald-400 mt-1">
                    {formatCurrency(car.price, currencyMode)}
                  </div>

                  {/* Image Card */}
                  <div className="h-32 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center my-3 relative">
                    <img
                      src={imagePath}
                      alt={car.model}
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/cars/default.svg';
                      }}
                    />
                  </div>

                  {/* Specs Pill Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 py-1">
                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                      <div className="text-slate-400">Mileage</div>
                      <div className="font-bold">{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</div>
                    </div>

                    <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                      <div className="text-slate-400">MPG</div>
                      <div className="font-bold truncate">{car.mpg}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                    <Star size={14} fill="#F59E0B" />
                    <span>{car.consumerRating || 'N/A'}</span>
                  </div>

                  <button
                    onClick={() => setSelectedCarForModal(car)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    View Specs
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
