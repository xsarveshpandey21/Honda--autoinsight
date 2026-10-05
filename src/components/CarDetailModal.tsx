import React from 'react';
import { X, Star, GitCompare, Check, Zap, Gauge, Fuel, Settings } from 'lucide-react';
import type { CleanedCarRecord } from '../types';
import { getModelImagePath, getModelColors } from '../utils/carImages';
import { formatCurrency } from '../utils/currency';
import { useDataStore } from '../store/useDataStore';

interface CarDetailModalProps {
  car: CleanedCarRecord | null;
  onClose: () => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose }) => {
  const { compareCarIds, toggleCompareCar, currencyMode } = useDataStore();

  if (!car) return null;

  const imagePath = getModelImagePath(car.baseModel);
  const colors = getModelColors(car.baseModel);
  const isCompared = compareCarIds.includes(car.id);

  const ratingsList = [
    { label: 'Overall Consumer Rating', score: car.consumerRating },
    { label: 'Comfort Rating', score: car.comfortRating },
    { label: 'Interior Design', score: car.interiorDesignRating },
    { label: 'Performance', score: car.performanceRating },
    { label: 'Value For Money', score: car.valueForMoneyRating },
    { label: 'Exterior Styling', score: car.exteriorStylingRating },
    { label: 'Reliability Rating', score: car.reliabilityRating },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden relative my-8">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                {car.condition}
              </span>
              <span className="text-xs font-mono text-slate-400">VIN: {car.vin}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              {car.year} {car.make} {car.model}
            </h2>
            <p className="text-xs text-slate-400">Stock #: {car.stockNo} • Location: {car.state} ({car.sellerType})</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleCompareCar(car.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                isCompared
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isCompared ? <Check size={14} /> : <GitCompare size={14} />}
              <span>{isCompared ? 'Compared' : '+ Compare'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Image & Price Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
            <div className="h-48 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 relative">
              <img
                src={imagePath}
                alt={car.model}
                className="w-full h-full object-contain filter drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/cars/default.svg';
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Listed Inventory Price ({currencyMode})</span>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {formatCurrency(car.price, currencyMode)}
                </div>
              </div>

              {/* Value Score Pill */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Zap size={14} className="text-amber-400" /> Value Score
                  </span>
                  <span className="text-amber-400 font-bold text-sm">{car.valueScore ? `${car.valueScore} / 100` : 'N/A'}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(car.valueScore || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                  Combines Value for Money (40%), Reliability (30%), & Consumer Rating (30%) adjusted for price tier.
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle Specifications</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1 mb-0.5"><Gauge size={14}/> Mileage</div>
                <div className="font-bold text-slate-100">{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1 mb-0.5"><Fuel size={14}/> MPG</div>
                <div className="font-bold text-slate-100">{car.mpg}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1 mb-0.5"><Settings size={14}/> Drivetrain</div>
                <div className="font-bold text-slate-100">{car.drivetrain}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1 mb-0.5"><Fuel size={14}/> Fuel Type</div>
                <div className="font-bold text-slate-100">{car.fuelType}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 mb-0.5">Transmission</div>
                <div className="font-bold text-slate-100 truncate">{car.transmission}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 mb-0.5">Engine</div>
                <div className="font-bold text-slate-100 truncate">{car.engine}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 mb-0.5">Exterior Color</div>
                <div className="font-bold text-slate-100 truncate">{car.exteriorColor}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-slate-400 mb-0.5">Interior Color</div>
                <div className="font-bold text-slate-100 truncate">{car.interiorColor}</div>
              </div>
            </div>
          </div>

          {/* Rating Scores Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Consumer Ratings Breakdown (out of 5.0)</h4>
            <div className="space-y-2.5">
              {ratingsList.map((r) => (
                <div key={r.label} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{r.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${((r.score || 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-amber-400 w-8 text-right font-mono">
                      {r.score ? r.score.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
