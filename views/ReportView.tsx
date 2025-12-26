
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
    const team = g.teams[teamKey];
    if (!team.startDate) return [];

    const [year, month] = yearMonth.split('-').map(Number);
    const firstOfMonth = new Date(year, month - 1, 1);
    const lastOfMonth = new Date(year, month, 0);

    const cycleDays = g.dutyType === DutyType.STANDARD_48X144 ? 8 : 4;
    const workDuration = g.dutyType === DutyType.STANDARD_48X144 ? 2 : 1;

    const baseStart = new Date(team.startDate + 'T12:00:00');
    const days: string[] = [];

    if (baseStart > lastOfMonth) return [];

    let current = new Date(baseStart);
    const diffTime = firstOfMonth.getTime() - current.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      const cyclesToSkip = Math.floor(diffDays / cycleDays);
      current.setDate(current.getDate() + (cyclesToSkip * cycleDays));
    }

    current.setDate(current.getDate() - cycleDays);

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

  const handlePrint = () => window.print();

  const handleCopy = () => {
    if (!reportRef.current) return;

    let text = `POLÍCIA MILITAR DE PERNAMBUCO\n`;
    text += `ESCALA DE SERVIÇO - ${getFormattedMonth()} / ${getYear()}\n\n`;
    
    platoonsWithGarrisons.forEach(platoon => {
      text += `UNIDADE: ${platoon.name}\n`;
      text += `CIDADE: ${platoon.city}\n`;
      text += `==========================================\n`;
      
      platoon.garrisons.forEach(g => {
        text += `\nPOSTO/VTR: ${g.name}\n`;
        (['A', 'B', 'C', 'D'] as const).forEach(t => {
          const mils = getOfficers(g.teams[t].officerIds);
          const days = getTeamDays(g, t, selectedMonth);
          if (mils.length > 0) {
            text += `EQUIPE ${t}: ${mils.map((m, idx) => {
              const role = idx === 0 ? 'CMT' : idx === 1 ? 'MOT' : 'PATR';
              return `${m.rank} ${m.registration} ${m.warName} (${role})`;
            }).join(', ')}\n`;
            text += `DATAS: ${days.join(', ')}\n`;
          }
        });
      });
      text += `\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getFormattedMonth = () => {
    return new Date(selectedMonth + '-02').toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  };

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm no-print flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Mês de Referência</label>
          <input
            type="month"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center font-bold text-sm transition-all border border-slate-200">
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />} 
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
            <button onClick={handlePrint} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center font-bold text-sm shadow-lg transform transition-transform active:scale-95">
              <Download className="w-4 h-4 mr-2" /> Gerar PDF / Imprimir
            </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-4 no-print-space bg-gray-50 py-4">
        {platoonsWithGarrisons.map((platoon) => (
          <div key={platoon.id} className="bg-white p-8 md:p-14 print:p-8 min-h-[1100px] text-slate-900 font-serif mx-auto max-w-[950px] shadow-2xl print:shadow-none print:break-after-page border border-slate-300 print:border-none relative overflow-hidden">
            
            {/* Elemento Institucional de Fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none rotate-[-45deg] z-0">
               <h1 className="text-[140px] font-black uppercase whitespace-nowrap">POLÍCIA MILITAR</h1>
            </div>

            {/* Cabeçalho Oficial Militar */}
            <div className="text-center space-y-1 mb-12 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Estado de Pernambuco</p>
              <p className="text-[14px] font-black uppercase text-slate-900">Secretaria de Defesa Social</p>
              <div className="inline-block border-b-2 border-slate-900 px-8 mb-2">
                 <p className="text-[16px] font-black uppercase text-slate-900">Polícia Militar de Pernambuco</p>
              </div>
              <p className="text-[12px] font-bold uppercase text-slate-700 tracking-wider">{platoon.name}</p>
              
              <div className="mt-8 py-6 border-y-2 border-slate-900">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Escala de Serviço Operacional</h1>
                <p className="text-sm font-bold uppercase text-slate-600 mt-2">Mês: {getFormattedMonth()} / Ano: {getYear()}</p>
              </div>
            </div>

            {platoon.garrisons.map(garrison => (
              <div key={garrison.id} className="mb-12 page-break-inside-avoid relative z-10">
                <div className="bg-slate-900 text-white p-2.5 text-center text-[11px] font-black uppercase tracking-[0.2em] rounded-t-sm">
                  GUARNIÇÃO: {garrison.name}
                </div>
                <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-2 border-slate-900 p-2 w-[12%] uppercase font-black text-center">Regime</th>
                      <th className="border-2 border-slate-900 p-2 w-[53%] uppercase font-black text-left pl-4">Efetivo Escalado (Grad/Matr/Guerra)</th>
                      <th className="border-2 border-slate-900 p-2 w-[25%] uppercase font-black text-center">Datas de Serviço</th>
                      <th className="border-2 border-slate-900 p-2 w-[10%] uppercase font-black text-center">Turno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['A', 'B', 'C', 'D'] as const).map((teamKey, idx) => {
                      const teamOfficers = getOfficers(garrison.teams[teamKey].officerIds);
                      const days = getTeamDays(garrison, teamKey, selectedMonth);
                      if (teamOfficers.length === 0) return null;

                      return (
                        <tr key={teamKey} className="group">
                          {idx === 0 && (
                            <td rowSpan={4} className="border-2 border-slate-900 p-2 text-center font-black align-middle text-[12px] bg-white">
                              {garrison.dutyType}
                            </td>
                          )}
                          <td className="border-2 border-slate-900 p-3 bg-white">
                            <div className="flex items-center space-x-2 mb-2">
                               <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">EQUIPE {teamKey}</span>
                            </div>
                            <div className="space-y-1.5 pl-1">
                                {teamOfficers.map((off, oIdx) => (
                                <div key={off.id} className="flex justify-between items-center border-b border-slate-200 pb-1">
                                    <div className="flex flex-col">
                                       <span className="uppercase font-bold text-slate-900 text-[11px]">
                                          {off.rank} <span className="text-slate-500 font-mono text-[10px] ml-1">{off.registration}</span> - {off.warName}
                                       </span>
                                    </div>
                                    <span className="font-black text-[9px] text-slate-400 uppercase italic tracking-tighter">
                                       {getRoleLabel(oIdx)}
                                    </span>
                                </div>
                                ))}
                            </div>
                          </td>
                          <td className="border-2 border-slate-900 p-2 text-center font-black tracking-[0.1em] text-slate-900 align-middle text-[12px] bg-slate-50/30">
                            {days.length > 0 ? days.join(', ') : '--'}
                          </td>
                          {idx === 0 && (
                            <td rowSpan={4} className="border-2 border-slate-900 p-2 text-center font-black align-middle text-[11px] bg-white">
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

            <div className="mt-32 flex flex-col items-center text-[11px] font-bold uppercase relative z-10">
              <div className="w-full grid grid-cols-2 gap-24">
                 <div className="text-center">
                    <div className="border-t-2 border-slate-900 pt-4 mx-auto w-4/5">
                      <p className="text-slate-900 font-black leading-tight">
                         {data.officers.find(o => o.id === platoon.commanderId)?.rank || 'COMANDANTE'} PM {data.officers.find(o => o.id === platoon.commanderId)?.warName || ''}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold mt-1">COMANDANTE DA UNIDADE</p>
                    </div>
                 </div>
                 <div className="text-center">
                    <div className="border-t-2 border-slate-900 pt-4 mx-auto w-4/5">
                      <p className="text-slate-900 font-black leading-tight">CHEFE DA P/1</p>
                      <p className="text-[10px] text-slate-600 font-bold mt-1">Sessão de Pessoal / Publicação</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white p-12 print:p-8 min-h-[500px] text-slate-900 font-serif mx-auto max-w-[950px] shadow-2xl print:shadow-none mb-12 border border-slate-300 print:border-none relative z-10">
          <div className="border-b-4 border-slate-900 pb-4 mb-10 text-center">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Relação de Efetivo em Afastamento</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Controle Operacional de Indisponibilidade</p>
          </div>
          <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border-2 border-slate-900 p-3 w-[65%] uppercase font-black tracking-widest text-left pl-6">Militar (Posto / Matrícula / Nome Completo)</th>
                <th className="border-2 border-slate-900 p-3 w-[35%] uppercase font-black tracking-widest text-center">Motivo do Afastamento</th>
              </tr>
            </thead>
            <tbody>
              {getUnavailableOfficers().length > 0 ? getUnavailableOfficers().map(off => (
                <tr key={off.id} className="even:bg-slate-50">
                  <td className="border-2 border-slate-900 p-3 font-bold uppercase px-8">
                     {off.rank} PM - {off.registration} - {off.fullName}
                  </td>
                  <td className="border-2 border-slate-900 p-3 font-black uppercase text-center text-red-700 bg-red-50/5">
                     {off.unavailabilityReason}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="border-2 border-slate-900 p-12 text-center text-slate-300 italic font-bold uppercase tracking-[0.2em]">Nenhuma restrição de efetivo registrada para o período.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-28 text-center text-[11px] font-bold uppercase">
             <div className="border-t-2 border-slate-900 pt-5 mx-auto w-1/3">
                <p className="font-black text-slate-900">CHEFE DA P/1</p>
                <p className="text-[10px] text-slate-600 font-bold mt-1">Conferência de Efetivo</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
