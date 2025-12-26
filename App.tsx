
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Menu, 
  X, 
  LayoutDashboard,
  Bell,
  UserCircle
} from 'lucide-react';
import { OfficerView } from './views/OfficerView';
import { PlatoonView } from './views/PlatoonView';
import { RosterView } from './views/RosterView';
import { ReportView } from './views/ReportView';
import { DashboardView } from './views/DashboardView';

export type View = 'dashboard' | 'officers' | 'platoons' | 'rosters' | 'reports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'officers', label: 'Efetivo', icon: Users },
    { id: 'platoons', label: 'Pelotões', icon: ShieldCheck },
    { id: 'rosters', label: 'Gerar Escala', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ];

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out no-print
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:w-64
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-xl font-bold tracking-tight">SGEP</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as View)}
                className={`
                  flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group mb-1
                  ${currentView === item.id 
                    ? 'bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${currentView === item.id ? 'text-slate-900' : 'group-hover:text-white'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-800">
            <div className="flex items-center p-3 rounded-xl bg-slate-800/50">
              <UserCircle className="w-10 h-10 text-slate-400" />
              <div className="ml-3">
                <p className="text-sm font-bold">Administrador</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">Unidade Operacional</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 no-print">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 capitalize truncate">
              {navItems.find(i => i.id === currentView)?.label}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentView === 'officers' && <OfficerView />}
          {currentView === 'platoons' && <PlatoonView />}
          {currentView === 'rosters' && <RosterView />}
          {currentView === 'reports' && <ReportView />}
        </div>
      </main>
    </div>
  );
};

export default App;
