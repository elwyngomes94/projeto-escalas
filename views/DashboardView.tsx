
import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CalendarCheck, AlertTriangle } from 'lucide-react';
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
    { label: 'Guarnições', value: stats.garrisons, icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Afastados (LTS/RTS)', value: stats.unavailable, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Visão Geral da Unidade</h3>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Bem-vindo ao sistema de gestão operacional. Utilize o menu lateral para gerenciar seu efetivo, configurar as unidades táticas (pelotões) e realizar a montagem automática das escalas de serviço 1x3.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    Lembre-se de atualizar o status de disponibilidade dos policiais antes de gerar novas escalas para evitar erros de escalação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
              <Users className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-xs font-medium">Novo Policial</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
              <CalendarCheck className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-xs font-medium">Gerar Escala</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
