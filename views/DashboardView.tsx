
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CalendarCheck, AlertTriangle, Plus, FileText } from 'lucide-react';
import { loadData } from '../store';
import { Officer, Platoon, Garrison } from '../types';

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    officers: 0,
    platoons: 0,
    garrisons: 0,
    unavailable: 0
  });

  useEffect(() => {
    const data = loadData();
    setStats({
      officers: data.officers.length,
      platoons: data.platoons.length,
      garrisons: data.garrisons.length,
      unavailable: data.officers.filter(o => !o.isAvailable).length
    });
  }, []);

  const statCards = [
    { label: 'Efetivo Total', value: stats.officers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pelotões', value: stats.platoons, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Escalas', value: stats.garrisons, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Afastados', value: stats.unavailable, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6 pb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center">
            <div className={`p-3 rounded-xl ${stat.bg} mb-3 md:mb-0 md:mr-4`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
             <ShieldCheck className="w-5 h-5 mr-2 text-amber-500" /> Visão Operacional
          </h3>
          <div className="space-y-4 relative z-10">
            <p className="text-gray-600 text-sm leading-relaxed">
              Sistema Centralizado de Gestão Operacional. Gerencie seu efetivo e publique escalas oficiais com segurança e agilidade.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-[11px] font-bold text-amber-800 uppercase leading-snug">
                    Aviso Importante
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Verifique as datas de LTS e férias antes de qualquer publicação mensal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:bg-amber-100">
                <Plus className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800 uppercase">Novo Policial</span>
                <span className="text-[10px] text-slate-500">Cadastro individual</span>
              </div>
            </button>
            <button className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:bg-emerald-100">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800 uppercase">Gerar Escala</span>
                <span className="text-[10px] text-slate-500">Escala 1x3 ou 48h</span>
              </div>
            </button>
            <button className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group sm:col-span-2">
              <div className="bg-white p-2 rounded-lg shadow-sm mr-4 group-hover:bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800 uppercase">Ver Relatórios</span>
                <span className="text-[10px] text-slate-500">Exportar PDF oficial para WhatsApp</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
