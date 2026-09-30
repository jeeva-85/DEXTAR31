import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingStoryDashboard } from './components/LandingStoryDashboard';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DataCenterDashboard } from './components/DataCenterDashboard';
import { TrainingCenterDashboard } from './components/TrainingCenterDashboard';
import { EventsDashboard } from './components/EventsDashboard';
import { TrackingDashboard } from './components/TrackingDashboard';
import { DownscalingDashboard } from './components/DownscalingDashboard';
import { UncertaintyDashboard } from './components/UncertaintyDashboard';
import { PhysicsDashboard } from './components/PhysicsDashboard';
import { AlertsDashboard } from './components/AlertsDashboard';
import { ModelsRegistryDashboard } from './components/ModelsRegistryDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ApiExplorerDashboard } from './components/ApiExplorerDashboard';
import { ClimateDashboard } from './components/ClimateDashboard';
import { SystemHealthDashboard } from './components/SystemHealthDashboard';
import { api } from './services/api';
import { CloudRain, Compass, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [systemHealth, setSystemHealth] = useState<any>({ status: 'HEALTHY' });
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hRes, dRes, eRes, mRes, aRes] = await Promise.allSettled([
        api.getSystemHealth(),
        api.getDataStatus(),
        api.listEvents(),
        api.listModels(),
        api.listAlerts()
      ]);

      if (hRes.status === 'fulfilled') setSystemHealth(hRes.value);
      if (dRes.status === 'fulfilled') setDataStatus(dRes.value);
      if (eRes.status === 'fulfilled') setEvents(eRes.value);
      if (mRes.status === 'fulfilled') setModels(mRes.value);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value);
    } catch (err) {
      console.warn('Initial data preload notice:', err);
    }
  };

  const refreshHealth = async () => {
    try {
      const h = await api.getSystemHealth();
      setSystemHealth(h);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshDataStatus = async () => {
    try {
      const d = await api.getDataStatus();
      setDataStatus(d);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshModels = async () => {
    try {
      const m = await api.listModels();
      setModels(m);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Application Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemHealth={systemHealth} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6">
        {activeTab === 'landing' && (
          <LandingStoryDashboard onNavigate={setActiveTab} />
        )}
        {activeTab === 'overview' && (
          <OverviewDashboard 
            events={events} 
            models={models} 
            alerts={alerts} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'data' && (
          <DataCenterDashboard 
            dataStatus={dataStatus} 
            onRefresh={refreshDataStatus} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'training' && (
          <TrainingCenterDashboard 
            models={models} 
            onRefresh={refreshModels} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'events' && (
          <EventsDashboard 
            events={events} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'tracking' && (
          <TrackingDashboard 
            events={events} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'downscaling' && (
          <DownscalingDashboard 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'uncertainty' && (
          <UncertaintyDashboard 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'physics' && (
          <PhysicsDashboard 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'alerts' && (
          <AlertsDashboard 
            alerts={alerts} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'models' && (
          <ModelsRegistryDashboard 
            models={models} 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'api_explorer' && (
          <ApiExplorerDashboard />
        )}
        {activeTab === 'climate' && (
          <ClimateDashboard 
            onNavigate={setActiveTab} 
          />
        )}
        {activeTab === 'system' && (
          <SystemHealthDashboard 
            systemHealth={systemHealth} 
            onRefreshHealth={refreshHealth} 
            onNavigate={setActiveTab} 
          />
        )}
      </main>

      {/* Operational Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800 font-sans">SIH26078 Extreme Weather Intelligence System</span>
            <span className="text-slate-300">|</span>
            <span>Ministry of Earth Sciences (MoES) • NCMRWF</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ALL SUBSYSTEMS SYNCHRONIZED
            </span>
            <span className="text-slate-300">|</span>
            <span>HORIZON: DAY 3 → DAY 10</span>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => setActiveTab('api_explorer')} 
              className="text-sky-600 hover:underline font-semibold"
            >
              REST API Explorer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
