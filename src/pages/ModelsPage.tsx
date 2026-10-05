import React, { useMemo, useState } from 'react';
import { 
  Car, 
  DollarSign, 
  Gauge, 
  Star, 
  PieChart as PieIcon, 
  BarChart2, 
  ArrowUpDown,
  Filter,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ScatterChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import { useDataStore } from '../store/useDataStore';
import { QuickFiltersBar } from '../components/QuickFiltersBar';
import { getModelImagePath, getModelColors, MODEL_COLORS } from '../utils/carImages';
import { formatCurrency } from '../utils/currency';
import type { ModelSummary } from '../types';

export const ModelsPage: React.FC = () => {
  const { filteredDataset, setSelectedCarForModal, currencyMode } = useDataStore();
  const [selectedModelFilter, setSelectedModelFilter] = useState<string | null>(null);

  // Group dataset by base model
  const modelSummaries: ModelSummary[] = useMemo(() => {
    const map: Record<string, {
      baseModel: string;
      cars: typeof filteredDataset;
    }> = {};

    filteredDataset.forEach(car => {
      if (!map[car.baseModel]) {
        map[car.baseModel] = { baseModel: car.baseModel, cars: [] };
      }
      map[car.baseModel].cars.push(car);
    });

    return Object.values(map).map(({ baseModel, cars }) => {
      const totalListings = cars.length;
      const inventoryValue = cars.reduce((sum, c) => sum + (c.price || 0), 0);
      const validPrices = cars.filter(c => c.price !== null);
      const avgPrice = validPrices.length > 0 ? Math.round(inventoryValue / validPrices.length) : 0;
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(c => c.price!)) : 0;
      const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map(c => c.price!)) : 0;

      const validMileages = cars.filter(c => c.mileage !== null);
      const avgMileage = validMileages.length > 0 ? Math.round(validMileages.reduce((sum, c) => sum + c.mileage!, 0) / validMileages.length) : 0;

      const validRatings = cars.filter(c => c.consumerRating !== null);
      const avgRating = validRatings.length > 0 ? parseFloat((validRatings.reduce((sum, c) => sum + c.consumerRating!, 0) / validRatings.length).toFixed(2)) : 0;

      const validScores = cars.filter(c => c.valueScore !== null);
      const avgValueScore = validScores.length > 0 ? parseFloat((validScores.reduce((sum, c) => sum + c.valueScore!, 0) / validScores.length).toFixed(1)) : 0;

      // Top condition
      const condCounts: Record<string, number> = {};
      cars.forEach(c => condCounts[c.condition] = (condCounts[c.condition] || 0) + 1);
      let topCondition = 'Used';
      let maxC = 0;
      Object.entries(condCounts).forEach(([cd, cnt]) => {
        if (cnt > maxC) { maxC = cnt; topCondition = cd; }
      });

      return {
        baseModel,
        totalListings,
        inventoryValue,
        avgPrice,
        avgMileage,
        avgRating,
        avgValueScore,
        minPrice,
        maxPrice,
        topCondition
      };
    }).sort((a, b) => b.totalListings - a.totalListings);
  }, [filteredDataset]);

  // Market Share Donut Chart Data
  const donutData = useMemo(() => {
    return modelSummaries.map(m => ({
      name: m.baseModel,
      value: m.totalListings,
      color: (MODEL_COLORS[m.baseModel] || { primary: '#64748B' }).primary
    }));
  }, [modelSummaries]);

  const activeSummaries = selectedModelFilter
    ? modelSummaries.filter(m => m.baseModel === selectedModelFilter)
    : modelSummaries;

  return (
    <div className="space-y-6 pb-12">
      <QuickFiltersBar />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100">Honda Model Portfolio Analytics</h2>
          <p className="text-xs text-slate-400">
            Base model categorization across {modelSummaries.length} Honda vehicle lines
          </p>
        </div>

        {selectedModelFilter && (
          <button
            onClick={() => setSelectedModelFilter(null)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-red-400 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Clear Filter ({selectedModelFilter})
          </button>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Market Share */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <PieIcon size={18} className="text-red-500" />
            <h3 className="text-base font-bold text-slate-100">Listing Share by Base Model</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Proportion of total inventory per Honda model line</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(data) => setSelectedModelFilter(data?.name || null)}
                  className="cursor-pointer"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = ((data.value / (filteredDataset.length || 1)) * 100).toFixed(1);
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs">
                          <div className="font-bold text-white">{data.name}</div>
                          <div className="text-slate-300">{data.value.toLocaleString()} listings ({pct}%)</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Average Price by Model */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart2 size={18} className="text-blue-500" />
            <h3 className="text-base font-bold text-slate-100">Average Inventory Price by Model</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Comparing price positioning across Honda models</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelSummaries.slice(0, 8)} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="baseModel" stroke="#64748B" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.baseModel}</div>
                          <div className="text-blue-400 font-bold">Avg Price: ${data.avgPrice.toLocaleString()}</div>
                          <div className="text-slate-400">Range: ${data.minPrice.toLocaleString()} - ${data.maxPrice.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgPrice" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <h3 className="text-lg font-bold text-slate-100 pt-4">Model Portfolio Cards ({activeSummaries.length})</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSummaries.map((m) => {
          const imagePath = getModelImagePath(m.baseModel);
          const colors = getModelColors(m.baseModel);

          return (
            <div
              key={m.baseModel}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-red-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                      {m.topCondition} Dominant
                    </span>
                    <h4 className="text-xl font-bold text-slate-100 mt-1">{m.baseModel}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Listings</div>
                    <div className="text-lg font-extrabold text-red-400">{m.totalListings}</div>
                  </div>
                </div>

                {/* SVG Render Card */}
                <div className="h-36 rounded-2xl bg-slate-950/80 border border-slate-800/80 p-2 flex items-center justify-center my-3 relative overflow-hidden">
                  <img
                    src={imagePath}
                    alt={m.baseModel}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/cars/default.svg';
                    }}
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Avg Price ({currencyMode})</div>
                    <div className="font-bold text-slate-100">{formatCurrency(m.avgPrice, currencyMode)}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Avg Mileage</div>
                    <div className="font-bold text-slate-100">{m.avgMileage.toLocaleString()} mi</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Avg Rating</div>
                    <div className="font-bold text-amber-400 flex items-center gap-1">
                      <Star size={12} fill="#F59E0B" /> {m.avgRating || 'N/A'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Value Score</div>
                    <div className="font-bold text-emerald-400 flex items-center gap-1">
                      <Zap size={12} /> {m.avgValueScore} / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Inventory Value Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Inventory Market Value:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(m.inventoryValue, currencyMode, true)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
