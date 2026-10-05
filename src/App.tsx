import React, { useEffect, useState } from 'react';
import { useDataStore } from './store/useDataStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UploadModal } from './components/UploadModal';
import { DataQualityModal } from './components/DataQualityModal';
import { CarDetailModal } from './components/CarDetailModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { SalesTrendsPage } from './pages/SalesTrendsPage';
import { ModelsPage } from './pages/ModelsPage';
import { RatingsPage } from './pages/RatingsPage';
import { CataloguePage } from './pages/CataloguePage';
import { ComparePage } from './pages/ComparePage';
import { ExecutiveReportPage } from './pages/ExecutiveReportPage';

export function App() {
  const { 
    activeTab, 
    initializeStore, 
    isLoading, 
    selectedCarForModal, 
    setSelectedCarForModal 
  } = useDataStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQualityReportOpen, setIsQualityReportOpen] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-extrabold text-white text-2xl shadow-xl shadow-red-600/40 animate-pulse">
          H
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing Honda AutoInsight Engine...
        </div>
        <p className="text-xs text-slate-500">Cleaning dataset and building client-side analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Layout Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Top Header */}
        <Header 
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenQualityReport={() => setIsQualityReportOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewPage onOpenQualityReport={() => setIsQualityReportOpen(true)} />
          )}

          {activeTab === 'trends' && <SalesTrendsPage />}

          {activeTab === 'models' && <ModelsPage />}

          {activeTab === 'ratings' && <RatingsPage />}

          {activeTab === 'catalogue' && <CataloguePage />}

          {activeTab === 'compare' && <ComparePage />}

          {activeTab === 'executive' && <ExecutiveReportPage />}
        </main>
      </div>

      {/* Interactive Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      <DataQualityModal 
        isOpen={isQualityReportOpen} 
        onClose={() => setIsQualityReportOpen(false)} 
      />

      <CarDetailModal 
        car={selectedCarForModal} 
        onClose={() => setSelectedCarForModal(null)} 
      />
    </div>
  );
}

export default App;
