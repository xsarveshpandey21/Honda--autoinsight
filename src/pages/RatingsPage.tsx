import React, { useMemo } from 'react';
import { 
  Star, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Award, 
  Info,
  TrendingUp,
  Layers
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ZAxis 
} from 'recharts';
import { useDataStore } from '../store/useDataStore';
import { QuickFiltersBar } from '../components/QuickFiltersBar';
import { formatCurrency } from '../utils/currency';
import type { RatingCategoryAvg } from '../types';

export const RatingsPage: React.FC = () => {
  const { filteredDataset, setSelectedCarForModal, currencyMode } = useDataStore();

  // Radar Chart data across 6 categories
  const radarData: RatingCategoryAvg[] = useMemo(() => {
    const calcAvg = (key: keyof typeof filteredDataset[0]) => {
      const valid = filteredDataset.filter(d => typeof d[key] === 'number' && d[key] !== null);
      if (valid.length === 0) return 0;
      const sum = valid.reduce((acc, curr) => acc + (curr[key] as number), 0);
      return parseFloat((sum / valid.length).toFixed(2));
    };

    return [
      { category: 'Comfort', score: calcAvg('comfortRating'), fullMark: 5 },
      { category: 'Interior Design', score: calcAvg('interiorDesignRating'), fullMark: 5 },
      { category: 'Performance', score: calcAvg('performanceRating'), fullMark: 5 },
      { category: 'Value For Money', score: calcAvg('valueForMoneyRating'), fullMark: 5 },
      { category: 'Exterior Styling', score: calcAvg('exteriorStylingRating'), fullMark: 5 },
      { category: 'Reliability', score: calcAvg('reliabilityRating'), fullMark: 5 },
    ];
  }, [filteredDataset]);

  // Scatter plot data (Price vs Rating)
  const scatterData = useMemo(() => {
    return filteredDataset
      .filter(c => c.price !== null && c.consumerRating !== null)
      .slice(0, 500) // limit for high performance rendering
      .map(c => ({
        id: c.id,
        name: `${c.year} ${c.make} ${c.model}`,
        price: c.price,
        rating: c.consumerRating,
        valueScore: c.valueScore || 50,
        model: c.baseModel
      }));
  }, [filteredDataset]);

  // Top Value Score Vehicles
  const topValueCars = useMemo(() => {
    return [...filteredDataset]
      .filter(c => c.valueScore !== null && c.price !== null)
      .sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0))
      .slice(0, 10);
  }, [filteredDataset]);

  return (
    <div className="space-y-6 pb-12">
      <QuickFiltersBar />

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={24} />
            Consumer Ratings & Value Score Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multidimensional evaluation across Comfort, Performance, Reliability, and Computed Value Score
          </p>
        </div>

        {/* Formula Explanatory Tooltip Box */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs text-slate-300 max-w-md">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400 mb-1">
            <Zap size={14} />
            <span>Value Score Algorithm Formula</span>
          </div>
          <p className="text-[11px] leading-tight text-slate-400">
            <code className="text-amber-300 font-mono">ValueScore = (Value*0.4 + Reliability*0.3 + Consumer*0.3) / PriceTierFactor</code>.
            Cheaper vehicles with high ratings score higher!
          </p>
        </div>
      </div>

      {/* Grid: Radar Chart & Price vs Rating Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 mb-1">Honda Multi-Category Rating Radar</h3>
          <p className="text-xs text-slate-400 mb-4">Average score across 6 key consumer dimensions (0 - 5.0)</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="category" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" fontSize={10} />
                <Radar name="Honda Portfolio" dataKey="score" stroke="#E60012" fill="#E60012" fillOpacity={0.4} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs">
                          <span className="font-bold text-white">{data.category}: </span>
                          <span className="font-bold text-amber-400">{data.score} / 5.0</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart: Price vs Rating */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 mb-1">Price vs. Consumer Rating Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Scatter plot of vehicle price against overall consumer rating score</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="price" name="Price" unit="$" stroke="#64748B" fontSize={11} />
                <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 5]} stroke="#64748B" fontSize={11} />
                <ZAxis type="number" dataKey="valueScore" range={[40, 200]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <div className="font-bold text-white">{data.name}</div>
                          <div className="text-emerald-400 font-bold">Price: ${data.price.toLocaleString()}</div>
                          <div className="text-amber-400 font-bold">Rating: {data.rating} / 5.0</div>
                          <div className="text-purple-400 font-semibold">Value Score: {data.valueScore} / 100</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="#E60012" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Best Value Vehicles Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="text-amber-400" size={20} />
          <h3 className="text-base font-bold text-slate-100">Top 10 High-Value Honda Listings</h3>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4">Listed Price</th>
              <th className="py-3 px-4">Consumer Rating</th>
              <th className="py-3 px-4">Reliability</th>
              <th className="py-3 px-4">Value Score</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {topValueCars.map((car, idx) => (
              <tr key={car.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-amber-400">#{idx + 1}</td>
                <td className="py-3 px-4 font-bold text-slate-100">
                  {car.year} {car.make} {car.model}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {car.condition}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(car.price, currencyMode)}</td>
                <td className="py-3 px-4 font-bold text-amber-400 flex items-center gap-1">
                  <Star size={12} fill="#F59E0B" /> {car.consumerRating || 'N/A'}
                </td>
                <td className="py-3 px-4 text-slate-300">{car.reliabilityRating || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold font-mono">
                    {car.valueScore} / 100
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelectedCarForModal(car)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
