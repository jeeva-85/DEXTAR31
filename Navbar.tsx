import React from 'react';
import { 
  CloudRain, Database, Cpu, Compass, Sliders, Activity, 
  ShieldAlert, BookOpen, BarChart3, Terminal, CheckCircle2, Globe, Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemHealth: any;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemHealth }) => {
  const tabs = [
    { id: 'landing', label: 'Tech Story', icon: Sparkles },
    { id: 'overview', label: '01 Overview', icon: Globe },
    { id: 'data', label: '02 Data Center', icon: Database },
    { id: 'training', label: '03 Training', icon: Cpu },
    { id: 'events', label: '04 Events', icon: CloudRain },
    { id: 'tracking', label: '06 Tracking', icon: Compass },
    { id: 'downscaling', label: '07 Downscaling', icon: Sliders },
    { id: 'uncertainty', label: '08 Uncertainty', icon: Activity },
    { id: 'physics', label: '09 Physics', icon: CheckCircle2 },
    { id: 'alerts', label: '10 Alerts', icon: ShieldAlert },
    { id: 'models', label: '11 Registry', icon: BookOpen },
    { id: 'analytics', label: '12 Analytics', icon: BarChart3 },
    { id: 'api_explorer', label: '13 API Explorer', icon: Terminal },
    { id: 'climate', label: 'Climate Context', icon: Globe },
    { id: 'system', label: '14 System', icon: Activity },
  ];

  const isHealthy = systemHealth?.status === 'HEALTHY';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand & Organization */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
                  SIH26078
                </span>
                <span className="badge-prototype">PROTOTYPE</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                MoES • NCMRWF Weather Intelligence
              </div>
            </div>
          </div>

          {/* Quick Subsystem Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM DEGRADED'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">ERA5 / IMDAA / NEPS-G / NCUM</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('api_explorer')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-600" />
              API Docs
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className="btn-primary text-xs !py-1.5 !px-3"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Platform Story
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto mt-2.5 pt-1 pb-0.5 border-t border-slate-100 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
