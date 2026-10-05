import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Car, 
  Star, 
  Grid, 
  GitCompare, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { PageTab } from '../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, filteredDataset, compareCarIds } = useDataStore();

  const navItems: { id: PageTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Sales Trends', icon: TrendingUp },
    { id: 'models', label: 'Models Analytics', icon: Car },
    { id: 'ratings', label: 'Ratings & Value', icon: Star },
    { id: 'catalogue', label: 'Car Catalogue', icon: Grid, badge: filteredDataset.length },
    { id: 'compare', label: 'Compare Vehicles', icon: GitCompare, badge: compareCarIds.length > 0 ? compareCarIds.length : undefined },
    { id: 'executive', label: 'Executive Report', icon: FileText },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-slate-900/95 border-r border-slate-800 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-red-600/30 shrink-0">
            H
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-100 tracking-wide text-base leading-tight">
                Honda <span className="text-red-500">AutoInsight</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Analytics & Dashboard
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'
                }`}
              />
              {!collapsed && (
                <span className="truncate text-sm flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs font-medium rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex flex-col space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <ShieldAlert size={14} className="text-red-400" />
            <span>Local Engine</span>
          </div>
          <span className="text-[11px] leading-tight text-slate-400">
            100% Client-side. Data stays on your device.
          </span>
        </div>
      )}
    </aside>
  );
};
