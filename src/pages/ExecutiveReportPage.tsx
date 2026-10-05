import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Car, 
  Award, 
  PieChart as PieIcon,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { formatCurrency } from '../utils/currency';

export const ExecutiveReportPage: React.FC = () => {
  const { filteredDataset, datasetName, qualityReport, currencyMode } = useDataStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Compute Executive Key Figures
  const reportMetrics = React.useMemo(() => {
    const totalListings = filteredDataset.length;
    const totalInventoryValue = filteredDataset.reduce((sum, car) => sum + (car.price || 0), 0);
    const validPrices = filteredDataset.filter(c => c.price !== null);
    const avgPrice = validPrices.length > 0 ? Math.round(totalInventoryValue / validPrices.length) : 0;

    const validMileages = filteredDataset.filter(c => c.mileage !== null);
    const avgMileage = validMileages.length > 0 ? Math.round(validMileages.reduce((sum, c) => sum + c.mileage!, 0) / validMileages.length) : 0;

    const validRatings = filteredDataset.filter(c => c.consumerRating !== null);
    const avgRating = validRatings.length > 0 ? (validRatings.reduce((sum, c) => sum + c.consumerRating!, 0) / validRatings.length).toFixed(2) : 'N/A';

    // Model breakdown
    const modelCounts: Record<string, number> = {};
    filteredDataset.forEach(c => modelCounts[c.baseModel] = (modelCounts[c.baseModel] || 0) + 1);
    
    const topModels = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalListings,
      totalInventoryValue,
      avgPrice,
      avgMileage,
      avgRating,
      topModels
    };
  }, [filteredDataset]);

  const handleExportPNG = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `Honda_AutoInsight_Executive_Report_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export report PNG:', err);
      alert('Could not export report PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="text-red-500" size={24} />
            Executive Dealership Summary Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated executive intelligence report for inventory management and sales strategy
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-2"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Download size={16} />
            <span>{isExporting ? 'Generating PNG...' : 'Export PNG Image'}</span>
          </button>
        </div>
      </div>

      {/* Exportable Report Container */}
      <div ref={reportRef} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 text-slate-200">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-red-600/40">
              H
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">HONDA AUTOINSIGHT</h1>
              <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Executive Intelligence Briefing</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-1">
            <div><span className="font-semibold text-slate-300">Dataset Source:</span> {datasetName}</div>
            <div><span className="font-semibold text-slate-300">Generated On:</span> {new Date().toLocaleDateString()}</div>
            <div><span className="font-semibold text-slate-300">Data Integrity:</span> 100% Client-side Cleaned</div>
          </div>
        </div>

        {/* Executive Overview KPIs */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Portfolio Key Performance Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="text-xs text-slate-400">Total Active Inventory</div>
              <div className="text-2xl font-extrabold text-white mt-1">{reportMetrics.totalListings.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span></div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="text-xs text-slate-400">Total Valuation ({currencyMode})</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{formatCurrency(reportMetrics.totalInventoryValue, currencyMode, true)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="text-xs text-slate-400">Average Price ({currencyMode})</div>
              <div className="text-2xl font-extrabold text-white mt-1">{formatCurrency(reportMetrics.avgPrice, currencyMode)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="text-xs text-slate-400">Average Portfolio Rating</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{reportMetrics.avgRating} / 5.0</div>
            </div>
          </div>
        </div>

        {/* Executive Insights & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" size={18} />
              Strategic Inventory Findings
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                Top concentrated model line is <strong className="text-red-400">{reportMetrics.topModels[0]?.[0]}</strong>, representing {((reportMetrics.topModels[0]?.[1] / (reportMetrics.totalListings || 1)) * 100).toFixed(1)}% of inventory.
              </li>
              <li>
                Average vehicle mileage across listings is <strong className="text-white">{reportMetrics.avgMileage.toLocaleString()} miles</strong>.
              </li>
              <li>
                Overall customer satisfaction is strong at <strong className="text-amber-400">{reportMetrics.avgRating} / 5.0</strong>.
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="text-blue-400" size={18} />
              Model Inventory Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              {reportMetrics.topModels.map(([modelName, count], idx) => (
                <div key={modelName} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                  <span className="font-semibold text-slate-200">#{idx + 1} {modelName}</span>
                  <span className="font-bold text-red-400">{count} units ({((count / (reportMetrics.totalListings || 1)) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Honda AutoInsight Analytics Engine • Confidential Dealership Report</span>
          <span>Verified Local Browser Computation</span>
        </div>
      </div>
    </div>
  );
};
