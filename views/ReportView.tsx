
import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Copy, Check, Download, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { loadData } from '../store';
import { Garrison, DutyType, Platoon, TeamData, Officer } from '../types';

export const ReportView: React.FC = () => {
  const [data, setData] = useState<{officers: Officer[], platoons: Platoon[], garrisons: Garrison[]}>({
    officers: [],
    platoons: [],
    garrisons: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await loadData();
      setData(result);
      setLoading(false);
    };
    fetchData();
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

  const generateWhatsAppText = () => {
    let text = `*ESCALA DE SERVIÇO OPERACIONAL*\n`;
    text += `*MÊS: ${getFormattedMonth()} / ${getYear()}*\n\n`;

    platoonsWithGarrisons.forEach(platoon => {
      text += `*--- ${platoon.name} ---*\n`;
      platoon.garrisons.forEach(garrison => {
        text += `\n*VTR/GUARNIÇÃO: ${garrison.name}*\n`;
        text += `Horário: ${garrison.startTime} às ${garrison.endTime}\n`;
        
        (['A', 'B', 'C', 'D'] as const).forEach(teamKey => {
          const teamOfficers = getOfficers(garrison.teams[teamKey].officerIds);
          const days = getTeamDays(garrison, teamKey, selectedMonth);
          
          if (teamOfficers.length > 0 && days.length > 0) {
            text += `\n*EQUIPE ${teamKey}* (Dias: ${days.join(', ')})\n`;
            teamOfficers.forEach((off, idx) => {
              text += `${idx + 1}. ${off.rank} ${off.warName} (*${off.registration}*) - ${getRoleLabel(idx)}\n`;
            });
          }
        });
      });
      text += `\n`;
    });

    const unavailable = getUnavailableOfficers();
    if (unavailable.length > 0) {
      text += `*AFASTAMENTOS / INDISPONIBILIDADES:*\n`;
      unavailable.forEach(off => {
        text += `- ${off.rank} ${off.warName} (*${off.registration}*): ${off.unavailabilityReason}\n`;
      });
    }

    return text;
  };

  const shareToWhatsApp = () => {
    const text = generateWhatsAppText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const copyToClipboard = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Processando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm no-print flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mês de Referência</label>
          <input
            type="month"
            className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
            <button 
              onClick={() => window.print()} 
              className="px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-xs shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <Download className="w-5 h-5 mr-2" /> PDF / IMPRIMIR
            </button>
            <button 
              onClick={shareToWhatsApp} 
              className="px-4 py-3 bg-green-600 text-white rounded-xl font-black text-xs shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> WHATSAPP
            </button>
            <button 
              onClick={copyToClipboard} 
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-black text-xs shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? 'COPIADO' : 'COPIAR TEXTO'}
            </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-gray-100 py-4 no-print-space overflow-x-auto rounded-xl md:rounded-none">
        <div className="inline-block min-w-full md:block">
          {platoonsWithGarrisons.map((platoon) => (
            <div key={platoon.id} className="a4-page font-sans text-slate-900 relative overflow-hidden">
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none select-none rotate-[-45deg] z-0">
                <h1 className="text-[120px] font-black uppercase whitespace-nowrap">POLÍCIA MILITAR</h1>
              </div>

              <div className="text-center space-y-0.5 mb-10 relative z-10">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-500">Estado de Pernambuco</p>
                <p className="text-[14px] font-medium uppercase text-slate-900">Secretaria de Defesa Social</p>
                <div className="inline-block border-b border-slate-900 px-6 mb-1">
                  <p className="text-[16px] font-bold uppercase text-slate-900">Polícia Militar de Pernambuco</p>
                </div>
                <p className="text-[12px] font-medium uppercase text-slate-700 tracking-wider">{platoon.name}</p>
                
                <div className="mt-6 py-4 border-y border-slate-900">
                  <h1 className="text-[22px] font-bold uppercase tracking-tight text-slate-900">Escala de Serviço Operacional</h1>
                  <p className="text-[14px] font-medium uppercase text-slate-600 mt-1">Mês: {getFormattedMonth()} / Ano: {getYear()}</p>
                </div>
              </div>

              {platoon.garrisons.map(garrison => (
                <div key={garrison.id} className="mb-8 page-break-inside-avoid relative z-10">
                  <div className="bg-slate-900 text-white p-2 text-center text-[11px] font-bold uppercase tracking-[0.1em] rounded-t-sm">
                    GUARNIÇÃO: {garrison.name}
                  </div>
                  <table className="w-full border-collapse border border-slate-900 text-[11px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-900 p-1.5 w-[12%] uppercase font-bold text-center">Regime</th>
                        <th className="border border-slate-900 p-1.5 w-[53%] uppercase font-bold text-left pl-4">Efetivo Escalado</th>
                        <th className="border border-slate-900 p-1.5 w-[25%] uppercase font-bold text-center">Datas</th>
                        <th className="border border-slate-900 p-1.5 w-[10%] uppercase font-bold text-center">Turno</th>
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
                              <td rowSpan={4} className="border border-slate-900 p-1.5 text-center font-bold align-middle text-[12px] bg-white">
                                {garrison.dutyType}
                              </td>
                            )}
                            <td className="border border-slate-900 p-2 bg-white">
                              <div className="flex items-center space-x-2 mb-1.5">
                                <span className="bg-slate-100 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-200 uppercase">Eq {teamKey}</span>
                              </div>
                              <div className="space-y-1 pl-1">
                                  {teamOfficers.map((off, oIdx) => (
                                  <div key={off.id} className="flex justify-between items-center border-b border-slate-50 pb-0.5">
                                      <div className="flex flex-col">
                                        <span className="uppercase font-normal text-slate-900 text-[11.5px]">
                                            {off.rank} <span className="font-black text-black ml-0.5">{off.registration}</span> - {off.warName}
                                        </span>
                                      </div>
                                      <span className="font-bold text-[10px] text-black uppercase tracking-tighter">
                                        {getRoleLabel(oIdx)}
                                      </span>
                                  </div>
                                  ))}
                              </div>
                            </td>
                            <td className="border border-slate-900 p-1.5 text-center font-bold tracking-[0.05em] text-slate-900 align-middle text-[12px] bg-slate-50/20">
                              {days.length > 0 ? days.join(', ') : '--'}
                            </td>
                            {idx === 0 && (
                              <td rowSpan={4} className="border border-slate-900 p-1.5 text-center font-bold align-middle text-[11px] bg-white leading-relaxed">
                                {garrison.startTime || '07:00'}h<br/>às<br/>{garrison.endTime || '07:00'}h
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="mt-20 flex flex-col items-center text-[11px] font-bold uppercase relative z-10">
                <div className="w-full grid grid-cols-2 gap-16">
                  <div className="text-center">
                      <div className="border-t border-slate-900 pt-3 mx-auto w-4/5">
                        <p className="text-slate-900 font-bold leading-tight">
                          {data.officers.find(o => o.id === platoon.commanderId)?.rank || 'COMANDANTE'} PM {data.officers.find(o => o.id === platoon.commanderId)?.warName || ''}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">COMANDANTE DA UNIDADE</p>
                      </div>
                  </div>
                  <div className="text-center">
                      <div className="border-t border-slate-900 pt-3 mx-auto w-4/5">
                        <p className="text-slate-900 font-bold leading-tight">CHEFE DA P/1</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Sessão de Pessoal</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="a4-page font-sans text-slate-900 mb-12 relative z-10">
            <div className="border-b-2 border-slate-900 pb-3 mb-8 text-center">
              <h2 className="text-[18px] font-bold uppercase tracking-tight text-slate-900">Efetivo em Afastamento</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-widest">Controle Operacional / Aditamento</p>
            </div>
            <table className="w-full border-collapse border border-slate-900 text-[11px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="border border-slate-900 p-2 w-[65%] uppercase font-bold tracking-widest text-left pl-4">Militar</th>
                  <th className="border border-slate-900 p-2 w-[35%] uppercase font-bold tracking-widest text-center">Situação</th>
                </tr>
              </thead>
              <tbody>
                {getUnavailableOfficers().map(off => (
                  <tr key={off.id} className="even:bg-slate-50">
                    <td className="border border-slate-900 p-2 font-normal uppercase px-6">
                      {off.rank} PM - <span className="font-black text-black">{off.registration}</span> - {off.fullName}
                    </td>
                    <td className="border border-slate-900 p-2 font-bold uppercase text-center text-red-700">
                      {off.unavailabilityReason}
                    </td>
                  </tr>
                ))}
                {getUnavailableOfficers().length === 0 && (
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-10 text-center text-slate-300 italic uppercase tracking-widest">Nenhuma restrição registrada.</td>
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
