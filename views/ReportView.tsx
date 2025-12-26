
import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Copy, Check, Download } from 'lucide-react';
import { loadData } from '../store';
import { Garrison, DutyType, Platoon, TeamData } from '../types';

export const ReportView: React.FC = () => {
  const [data, setData] = useState(loadData());
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const getOfficers = (ids: string[]) => {
    return data.officers.filter(o => ids.includes(o.id));
  };

  const getUnavailableOfficers = () => {
    return data.officers.filter(o => !o.isAvailable);
  };

  const getTeamDays = (g: Garrison, teamKey: 'A' | 'B' | 'C' | 'D', yearMonth: string) => {
    if (g.dutyType === DutyType.COMPLEMENTARY) {
      const [year, month] = yearMonth.split('-').map(Number);
      return (g.specificDates || [])
        .filter(d => {
          const dt = new Date(d + 'T12:00:00');
          return dt.getFullYear() === year && dt.getMonth() + 1 === month;
        })
        .map(d => d.split('-')[2])
        .sort((a, b) => parseInt(a) - parseInt(b));
    }

    const team = g.teams[teamKey];
    if (!team.startDate) return [];

    const [year, month] = yearMonth.split('-').map(Number);
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);

    const cycleDays = g.dutyType === DutyType.STANDARD_48X144 ? 8 : 4;
    const workDuration = g.dutyType === DutyType.STANDARD_48X144 ? 2 : 1;

    const baseStart = new Date(team.startDate + 'T12:00:00');
    if (baseStart > lastOfMonth) return [];

    let current = new Date(baseStart);
    const diffTime = firstOfMonth.getTime() - current.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const cyclesToSkip = Math.floor(diffDays / cycleDays);
      current.setDate(current.getDate() + (cyclesToSkip * cycleDays));
    }

    current.setDate(current.getDate() - cycleDays);

    const days: string[] = [];
    while (current <= lastOfMonth) {
      for (let i = 0; i < workDuration; i++) {
        const d = new Date(current);
        d.setDate(d.getDate() + i);
        if (d >= firstOfMonth && d <= lastOfMonth) {
          days.push(d.getDate().toString().padStart(2, '0'));
        }
      }
      current.setDate(current.getDate() + cycleDays);
    }

    return [...new Set(days)].sort((a, b) => parseInt(a) - parseInt(b));
  };

  const getFormattedMonth = () => new Date(selectedMonth + '-02').toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  const getYear = () => selectedMonth.split('-')[0];

  const platoonsWithGarrisons = data.platoons.map(p => ({
    ...p,
    garrisons: data.garrisons.filter(g => g.platoonId === p.id)
  })).filter(p => p.garrisons.length > 0);

  const getRoleLabel = (index: number) => {
    if (index === 0) return 'COMANDANTE';
    if (index === 1) return 'MOTORISTA';
    return 'PATRULHEIRO';
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm no-print flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mês de Referência</label>
          <input
            type="month"
            className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => window.print()} 
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs md:text-sm shadow-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <Download className="w-5 h-5 mr-2" /> PDF / RELATÓRIO
            </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-gray-100 py-4 no-print-space overflow-x-auto rounded-xl md:rounded-none">
        <div className="inline-block min-w-full md:block">
          {platoonsWithGarrisons.map((platoon) => (
            <div key={platoon.id} className="bg-white p-6 md:p-14 print:p-8 min-h-[1100px] text-slate-900 font-sans mx-auto w-[900px] max-w-full shadow-2xl print:shadow-none print:break-after-page border border-slate-300 print:border-none relative overflow-hidden mb-10 md:mb-12">
              
              {/* Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none rotate-[-45deg] z-0">
                <h1 className="text-[141px] font-black uppercase whitespace-nowrap">POLÍCIA MILITAR</h1>
              </div>

              {/* Cabeçalho Profissional */}
              <div className="text-center space-y-1 mb-12 relative z-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-500">Estado de Pernambuco</p>
                <p className="text-[15px] font-medium uppercase text-slate-900">Secretaria de Defesa Social</p>
                <div className="inline-block border-b-2 border-slate-900 px-8 mb-2">
                  <p className="text-[17px] font-medium uppercase text-slate-900">Polícia Militar de Pernambuco</p>
                </div>
                <p className="text-[13px] font-medium uppercase text-slate-700 tracking-wider">{platoon.name}</p>
                
                <div className="mt-8 py-6 border-y-2 border-slate-900">
                  <h1 className="text-[25px] font-medium uppercase tracking-tight text-slate-900">Escala de Serviço Operacional</h1>
                  <p className="text-[15px] font-medium uppercase text-slate-600 mt-2">Mês: {getFormattedMonth()} / Ano: {getYear()}</p>
                </div>
              </div>

              {platoon.garrisons.map(garrison => (
                <div key={garrison.id} className="mb-12 page-break-inside-avoid relative z-10">
                  <div className="bg-slate-900 text-white p-2.5 text-center text-[12px] font-medium uppercase tracking-[0.2em] rounded-t-sm">
                    GUARNIÇÃO: {garrison.name}
                  </div>
                  <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border-2 border-slate-900 p-2 w-[12%] uppercase font-medium text-center">Regime</th>
                        <th className="border-2 border-slate-900 p-2 w-[53%] uppercase font-medium text-left pl-4">Efetivo Escalado</th>
                        <th className="border-2 border-slate-900 p-2 w-[25%] uppercase font-medium text-center">Datas</th>
                        <th className="border-2 border-slate-900 p-2 w-[10%] uppercase font-medium text-center">Turno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(['A', 'B', 'C', 'D'] as const).map((teamKey, idx) => {
                        const teamOfficers = getOfficers(garrison.teams[teamKey].officerIds);
                        const days = getTeamDays(garrison, teamKey, selectedMonth);
                        if (teamOfficers.length === 0) return null;

                        return (
                          <tr key={teamKey}>
                            {idx === 0 && (
                              <td rowSpan={4} className="border-2 border-slate-900 p-2 text-center font-medium align-middle text-[13px] bg-white">
                                {garrison.dutyType}
                              </td>
                            )}
                            <td className="border-2 border-slate-900 p-3 bg-white">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-slate-100 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">Equipe {teamKey}</span>
                              </div>
                              <div className="space-y-1.5 pl-1">
                                  {teamOfficers.map((off, oIdx) => (
                                  <div key={off.id} className="flex justify-between items-center border-b border-slate-50 pb-1">
                                      <div className="flex flex-col">
                                        <span className="uppercase font-normal text-slate-900 text-[12px]">
                                            {off.rank} <span className="font-black text-slate-900 ml-1">{off.registration}</span> - {off.warName}
                                        </span>
                                      </div>
                                      <span className="font-bold text-[10px] text-black uppercase tracking-tighter">
                                        {getRoleLabel(oIdx)}
                                      </span>
                                  </div>
                                  ))}
                              </div>
                            </td>
                            <td className="border-2 border-slate-900 p-2 text-center font-medium tracking-[0.1em] text-slate-900 align-middle text-[13px] bg-slate-50/10">
                              {days.length > 0 ? days.join(', ') : '--'}
                            </td>
                            {idx === 0 && (
                              <td rowSpan={4} className="border-2 border-slate-900 p-2 text-center font-medium align-middle text-[11px] bg-white">
                                07:00h<br/>às<br/>07:00h
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="mt-32 flex flex-col items-center text-[12px] font-medium uppercase relative z-10">
                <div className="w-full grid grid-cols-2 gap-24">
                  <div className="text-center">
                      <div className="border-t-2 border-slate-900 pt-4 mx-auto w-4/5">
                        <p className="text-slate-900 font-medium leading-tight">
                          {data.officers.find(o => o.id === platoon.commanderId)?.rank || 'COMANDANTE'} PM {data.officers.find(o => o.id === platoon.commanderId)?.warName || ''}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">COMANDANTE DA UNIDADE</p>
                      </div>
                  </div>
                  <div className="text-center">
                      <div className="border-t-2 border-slate-900 pt-4 mx-auto w-4/5">
                        <p className="text-slate-900 font-medium leading-tight">CHEFE DA P/1</p>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">Sessão de Pessoal</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quadro de Indisponíveis */}
          <div className="bg-white p-10 md:p-12 print:p-8 min-h-[500px] text-slate-900 font-sans mx-auto w-[900px] max-w-full shadow-2xl print:shadow-none mb-12 border border-slate-300 print:border-none relative z-10">
            <div className="border-b-4 border-slate-900 pb-4 mb-10 text-center">
              <h2 className="text-[19px] font-medium uppercase tracking-tight text-slate-900">Efetivo em Afastamento</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Controle Operacional</p>
            </div>
            <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border-2 border-slate-900 p-3 w-[65%] uppercase font-medium tracking-widest text-left pl-6">Militar</th>
                  <th className="border-2 border-slate-900 p-3 w-[35%] uppercase font-medium tracking-widest text-center">Situação</th>
                </tr>
              </thead>
              <tbody>
                {getUnavailableOfficers().map(off => (
                  <tr key={off.id} className="even:bg-slate-50">
                    <td className="border-2 border-slate-900 p-3 font-normal uppercase px-8">
                      {off.rank} PM - <span className="font-black text-black">{off.registration}</span> - {off.fullName}
                    </td>
                    <td className="border-2 border-slate-900 p-3 font-medium uppercase text-center text-red-700">
                      {off.unavailabilityReason}
                    </td>
                  </tr>
                ))}
                {getUnavailableOfficers().length === 0 && (
                  <tr>
                    <td colSpan={2} className="border-2 border-slate-900 p-12 text-center text-slate-300 italic uppercase tracking-widest">Nenhuma restrição registrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
