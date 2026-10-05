import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Info, 
  Sparkles, 
  BarChart3, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useDataStore } from '../store/useDataStore';
import { QuickFiltersBar } from '../components/QuickFiltersBar';

export const SalesTrendsPage: React.FC = () => {
  const { filteredDataset, qualityReport, hasSimulatedDate, toggleSimulateDateColumn } = useDataStore();
  const [activeSubTab, setActiveSubTab] = useState<'yearly' | 'monthly'>('yearly');

  // Yearly Data Aggregation
  const yearlyData = useMemo(() => {
    const map: Record<number, { year: number; listings: number; totalValue: number }> = {};
    filteredDataset.forEach(car => {
      const y = car.year;
      if (!map[y]) {
        map[y] = { year: y, listings: 0, totalValue: 0 };
      }
      map[y].listings += 1;
      map[y].totalValue += (car.price || 0);
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        avgPrice: Math.round(item.totalValue / item.listings),
        formattedValue: parseFloat((item.totalValue / 1000000).toFixed(2))
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredDataset]);

  // Monthly Data Aggregation (if date column present/simulated)
  const monthlyData = useMemo(() => {
    if (!qualityReport?.dateColumnDetected) return [];

    const map: Record<string, { month: string; listings: number; totalValue: number }> = {};
    filteredDataset.forEach(car => {
      if (car.saleMonth) {
        const m = car.saleMonth;
        if (!map[m]) {
          map[m] = { month: m, listings: 0, totalValue: 0 };
        }
        map[m].listings += 1;
        map[m].totalValue += (car.price || 0);
      }
    });

    return Object.values(map)
      .map(item => ({
        ...item,
        avgPrice: Math.round(item.totalValue / item.listings),
        formattedValue: parseFloat((item.totalValue / 1000000).toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredDataset, qualityReport]);

  const hasDateColumn = qualityReport?.dateColumnDetected;

  return (
    <div className="space-y-6 pb-12">
      <QuickFiltersBar />

      {/* Subtab Toggle (Yearly vs Monthly) */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'yearly'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={16} />
            <span>Yearly Trends (Model Year)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'monthly'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar size={16} />
            <span>Monthly Trends</span>
            {hasDateColumn && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        <div className="text-xs text-slate-400 pr-3 hidden md:block">
          {hasDateColumn ? 'Date column detected & active' : 'Note: "Year" refers to Model Year'}
        </div>
      </div>

      {/* YEARLY SALES VIEW */}
      {activeSubTab === 'yearly' && (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Listings & Inventory Value by Model Year</h3>
                <p className="text-xs text-slate-400">
                  Distribution of available vehicle stock and market value per model year
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="listingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E60012" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E60012" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#E60012" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#2563EB" fontSize={11} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                            <div className="font-bold text-slate-100">Model Year: {data.year}</div>
                            <div className="text-red-400 font-semibold">Listings: {data.listings.toLocaleString()}</div>
                            <div className="text-blue-400 font-semibold">Inventory Value: ${data.formattedValue}M</div>
                            <div className="text-slate-300">Average Price: ${data.avgPrice.toLocaleString()}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="listings" name="Listings Count" stroke="#E60012" fillOpacity={1} fill="url(#listingsGrad)" />
                  <Area yAxisId="right" type="monotone" dataKey="formattedValue" name="Inventory Value ($M)" stroke="#2563EB" fillOpacity={1} fill="url(#valueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Year Breakdown Table */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-x-auto">
            <h3 className="text-base font-bold text-slate-100 mb-3">Model Year Summary Matrix</h3>
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Model Year</th>
                  <th className="py-3 px-4">Listings Count</th>
                  <th className="py-3 px-4">Inventory Market Value</th>
                  <th className="py-3 px-4">Average Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {yearlyData.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{row.year}</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">{row.listings.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">${row.totalValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-200 font-mono">${row.avgPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MONTHLY SALES VIEW */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          {!hasDateColumn ? (
            /* Friendly Info Card when Date Column is missing */
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-4 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Info size={32} />
              </div>

              <h3 className="text-xl font-bold text-slate-100">Monthly Sales Date Column Required</h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                Monthly sales analytics need a date column (e.g. <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">Sale_Date</code>, <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">Sold_Date</code>, or <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">Listing_Date</code>).
                Upload a file with one to unlock this view automatically.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={toggleSimulateDateColumn}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center space-x-2 transition-all"
                >
                  <Sparkles size={16} />
                  <span>Click to Simulate Monthly Date Column (2024-2025)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Monthly Sales Analytics Dashboard */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Monthly Sales & Inventory Volume</h3>
                    <p className="text-xs text-slate-400">
                      Active date column: <span className="text-purple-400 font-mono font-bold">{qualityReport?.dateColumnName}</span>
                    </p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                                <div className="font-bold text-slate-100">Month: {data.month}</div>
                                <div className="text-purple-400 font-bold">Listings Sold: {data.listings.toLocaleString()}</div>
                                <div className="text-emerald-400 font-semibold">Total Revenue: ${data.totalValue.toLocaleString()}</div>
                                <div className="text-slate-300">Avg Price: ${data.avgPrice.toLocaleString()}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="listings" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Listings Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
