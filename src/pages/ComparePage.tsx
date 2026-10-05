import React from 'react';
import { GitCompare, Trash2, Plus, Star, Zap, Gauge, Fuel, Check, AlertCircle } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { getModelImagePath, getModelColors } from '../utils/carImages';
import { formatCurrency } from '../utils/currency';

export const ComparePage: React.FC = () => {
  const { cleanedDataset, compareCarIds, toggleCompareCar, clearCompare, setActiveTab, setSelectedCarForModal, currencyMode } = useDataStore();

  const comparedCars = React.useMemo(() => {
    return cleanedDataset.filter(car => compareCarIds.includes(car.id));
  }, [cleanedDataset, compareCarIds]);

  if (comparedCars.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
          <GitCompare size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">No Vehicles Selected for Comparison</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select up to 4 Honda vehicles from the Car Catalogue or click "+ Compare" on any car detail modal to perform side-by-side specification and rating analysis.
        </p>
        <button
          onClick={() => setActiveTab('catalogue')}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/30 transition-all inline-flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Browse Car Catalogue</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <GitCompare className="text-red-500" size={24} />
            Side-by-Side Honda Specification Comparison ({comparedCars.length}/4)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare specs, pricing, ratings, and value scores across selected vehicles
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('catalogue')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus size={14} />
            <span>Add Vehicle</span>
          </button>

          <button
            onClick={clearCompare}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition-colors flex items-center space-x-1.5"
          >
            <Trash2 size={14} />
            <span>Clear Comparison</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comparedCars.map((car) => {
          const imagePath = getModelImagePath(car.baseModel);
          const colors = getModelColors(car.baseModel);

          return (
            <div
              key={car.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative"
            >
              <button
                onClick={() => toggleCompareCar(car.id)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Remove from comparison"
              >
                <Trash2 size={16} />
              </button>

              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                  {car.condition}
                </span>

                <h4 className="text-lg font-bold text-slate-100 mt-2 truncate">
                  {car.year} {car.make} {car.model}
                </h4>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(car.price, currencyMode)}
                </div>

                {/* SVG Render Card */}
                <div className="h-36 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center my-4">
                  <img
                    src={imagePath}
                    alt={car.model}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/cars/default.svg';
                    }}
                  />
                </div>

                {/* Spec List */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Value Score:</span>
                    <span className="font-bold text-purple-400 font-mono">{car.valueScore || 'N/A'} / 100</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Consumer Rating:</span>
                    <span className="font-bold text-amber-400">{car.consumerRating || 'N/A'} / 5.0</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Mileage:</span>
                    <span className="font-bold text-slate-200">{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">MPG:</span>
                    <span className="font-bold text-slate-200">{car.mpg}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Drivetrain:</span>
                    <span className="font-bold text-slate-200">{car.drivetrain}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Fuel Type:</span>
                    <span className="font-bold text-slate-200">{car.fuelType}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">State Location:</span>
                    <span className="font-bold text-slate-200">{car.state}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedCarForModal(car)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Full Specifications
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
