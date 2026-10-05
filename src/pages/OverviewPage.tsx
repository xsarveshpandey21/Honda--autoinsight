import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Car, 
  Gauge, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useDataStore } from '../store/useDataStore';
import { QuickFiltersBar } from '../components/QuickFiltersBar';
import { MODEL_COLORS, DEFAULT_MODEL_COLOR } from '../utils/carImages';
import { formatCurrency } from '../utils/currency';

interface OverviewPageProps {
  onOpenQualityReport: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onOpenQualityReport }) => {
  const { filteredDataset, cleanedDataset, qualityReport, setActiveTab, setSelectedCarForModal, currencyMode } = useDataStore();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalListings = filteredDataset.length;
    const totalValue = filteredDataset.reduce((sum, car) => sum + (car.price || 0), 0);
    const validPriceCount = filteredDataset.filter(c => c.price !== null).length;
    const avgPrice = validPriceCount > 0 ? Math.round(totalValue / validPriceCount) : 0;

    const validMileageCount = filteredDataset.filter(c => c.mileage !== null).length;
    const totalMileage = filteredDataset.reduce((sum, car) => sum + (car.mileage || 0), 0);
    const avgMileage = validMileageCount > 0 ? Math.round(totalMileage / validMileageCount) : 0;

    const validRatingCount = filteredDataset.filter(c => c.consumerRating !== null).length;
    const totalRating = filteredDataset.reduce((sum, car) => sum + (car.consumerRating || 0), 0);
    const avgRating = validRatingCount > 0 ? (totalRating / validRatingCount).toFixed(2) : 'N/A';

    // Model frequency
    const modelCounts: Record<string, number> = {};
    filteredDataset.forEach(c => {
      modelCounts[c.baseModel] = (modelCounts[c.baseModel] || 0) + 1;
    });

    let topModel = 'N/A';
    let topCount = 0;
    Object.entries(modelCounts).forEach(([m, cnt]) => {
      if (cnt > topCount) {
        topCount = cnt;
        topModel = m;
      }
    });

    return { totalListings, totalValue, avgPrice, avgMileage, avgRating, topModel, topCount };
  }, [filteredDataset]);

  // Model Distribution Chart Data
  const modelChartData = useMemo(() => {
    const map: Record<string, { baseModel: string; listings: number; totalValue: number }> = {};
    filteredDataset.forEach(car => {
      if (!map[car.baseModel]) {
        map[car.baseModel] = { baseModel: car.baseModel, listings: 0, totalValue: 0 };
      }
      map[car.baseModel].listings += 1;
      map[car.baseModel].totalValue += (car.price || 0);
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        avgPrice: Math.round(item.totalValue / item.listings),
        color: (MODEL_COLORS[item.baseModel] || DEFAULT_MODEL_COLOR).primary
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);
  }, [filteredDataset]);

  // Condition Pie Data
  const conditionData = useMemo(() => {
    const counts = { New: 0, Used: 0, Certified: 0 };
    filteredDataset.forEach(car => {
      if (counts[car.condition] !== undefined) {
        counts[car.condition] += 1;
      }
    });
    return [
      { name: 'New', value: counts.New, color: '#3B82F6' },
      { name: 'Used', value: counts.Used, color: '#F59E0B' },
      { name: 'Certified', value: counts.Certified, color: '#10B981' },
    ];
  }, [filteredDataset]);

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Filter Bar */}
      <QuickFiltersBar />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Listings */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Listings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Car size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.totalListings.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Listed Honda vehicles</span>
        </div>

        {/* KPI 2: Inventory Value */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Inventory Value ({currencyMode})</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            {formatCurrency(kpis.totalValue, currencyMode, true)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Sum of listing prices</span>
        </div>

        {/* KPI 3: Avg Price */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Average Price ({currencyMode})</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{formatCurrency(kpis.avgPrice, currencyMode)}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Per vehicle listing</span>
        </div>

        {/* KPI 4: Avg Mileage */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Average Mileage</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Gauge size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.avgMileage.toLocaleString()} mi</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Filtered inventory</span>
        </div>

        {/* KPI 5: Top Model */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Top Model</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-400 tracking-tight truncate">{kpis.topModel}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">{kpis.topCount} listings</span>
        </div>

        {/* KPI 6: Avg Rating */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Consumer Rating</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 tracking-tight">{kpis.avgRating} / 5.0</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Consumer score</span>
        </div>
      </div>

      {/* Main Charts & Quality Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Models by Listing Count */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Top Honda Models by Listings & Inventory Value</h3>
              <p className="text-xs text-slate-400">Listings count and average price across top models</p>
            </div>
            <button
              onClick={() => setActiveTab('models')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>View All Models</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="baseModel" stroke="#64748B" fontSize={11} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-slate-100">{data.baseModel}</div>
                          <div className="text-slate-300">Listings: <span className="font-bold text-white">{data.listings}</span></div>
                          <div className="text-emerald-400">Avg Price: <span className="font-bold">${data.avgPrice.toLocaleString()}</span></div>
                          <div className="text-blue-400">Total Inventory: <span className="font-bold">${(data.totalValue / 1000000).toFixed(2)}M</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="listings" radius={[6, 6, 0, 0]}>
                  {modelChartData.map((entry) => (
                    <Cell key={entry.baseModel} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Distribution & Data Quality Summary */}
        <div className="space-y-6">
          {/* Vehicle Condition Pie Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Inventory by Condition</h3>
            <p className="text-xs text-slate-400 mb-3">Distribution of New, Used, & Certified</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {conditionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const pct = ((data.value / (filteredDataset.length || 1)) * 100).toFixed(1);
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs">
                            <span className="font-bold text-white">{data.name}: </span>
                            <span className="text-slate-300">{data.value.toLocaleString()} ({pct}%)</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-xs mt-2 border-t border-slate-800 pt-3">
              {conditionData.map((c) => (
                <div key={c.name} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300 font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Card */}
          <div 
            onClick={onOpenQualityReport}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck size={16} />
                <span>Dataset Cleaning Report</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>Loaded Rows: <span className="font-bold text-white">{qualityReport?.totalLoadedRows.toLocaleString()}</span></div>
              <div>Duplicate VINs Removed: <span className="font-bold text-amber-400">{qualityReport?.duplicateVinsRemoved}</span></div>
              <div>Clean Valid Vehicles: <span className="font-bold text-emerald-400">{qualityReport?.validRowsCount.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
