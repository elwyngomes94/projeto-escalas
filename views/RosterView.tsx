
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Shield, Users, ArrowRight, Info, X, Layers, Check, AlertCircle, Search, Edit2, Copy, Clock, Loader2 } from 'lucide-react';
import { loadData, upsertGarrison, deleteGarrison } from '../store';
import { Officer, Platoon, Garrison, DutyType, TeamConfig, TeamData } from '../types';

type ActiveTeam = 'A' | 'B' | 'C' | 'D';

const initialTeams: TeamConfig = {
  A: { officerIds: [], startDate: '' },
  B: { officerIds: [], startDate: '' },
  C: { officerIds: [], startDate: '' },
  D: { officerIds: [], startDate: '' }
};

export const RosterView: React.FC = () => {
  const [data, setData] = useState<{officers: Officer[], platoons: Platoon[], garrisons: Garrison[]}>({
    officers: [],
    platoons: [],
    garrisons: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<ActiveTeam>('A');
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState('');
  const [platoonId, setPlatoonId] = useState('');
  const [teams, setTeams] = useState<TeamConfig>(initialTeams);
  const [dutyType, setDutyType] = useState<DutyType>(DutyType.STANDARD_1X3);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('07:00');

  const refreshData = async () => {
    setLoading(true);
    const result = await loadData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const assignedOfficersMap = React.useMemo(() => {
    const map = new Map<string, string>();
    data.garrisons.forEach(g => {
      if (g.id === editingId) return;
      const allIds = [
        ...g.teams.A.officerIds, 
        ...g.teams.B.officerIds, 
        ...g.teams.C.officerIds, 
        ...g.teams.D.officerIds
      ];
      allIds.forEach(id => map.set(id, g.name));
    });
    return map;
  }, [data.garrisons, editingId]);

  const handleSaveGarrison = async () => {
    if (!name || !platoonId) {
      alert('Preencha o Nome da Guarnição e selecione um Pelotão.');
      return;
    }

    const payload: Garrison = {
      id: editingId || '',
      name,
      platoonId,
      teams,
      dutyType,
      specificDates: dutyType === DutyType.COMPLEMENTARY ? specificDates : [],
      startTime,
      endTime
    };

    try {
      await upsertGarrison(payload);
      await refreshData();
      closeModal();
    } catch (e: any) {
      alert('Erro ao publicar escala: ' + e.message);
    }
  };

  const handleAddDate = () => {
    if (newDate && !specificDates.includes(newDate)) {
      setSpecificDates([...specificDates, newDate].sort());
      setNewDate('');
    }
  };

  const handleRemoveDate = (date: string) => {
    setSpecificDates(specificDates.filter(d => d !== date));
  };

  const openEditModal = (garrison: Garrison) => {
    setEditingId(garrison.id);
    setName(garrison.name);
    setPlatoonId(garrison.platoonId);
    setTeams(garrison.teams);
    setDutyType(garrison.dutyType);
    setSpecificDates(garrison.specificDates || []);
    setStartTime(garrison.startTime || '07:00');
    setEndTime(garrison.endTime || '07:00');
    setActiveTeamTab('A');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setPlatoonId('');
    setTeams(initialTeams);
    setDutyType(DutyType.STANDARD_1X3);
    setSpecificDates([]);
    setNewDate('');
    setStartTime('07:00');
    setEndTime('07:00');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta escala permanentemente?')) {
      try {
        await deleteGarrison(id);
        await refreshData();
      } catch (e: any) {
        alert('Erro ao excluir: ' + e.message);
      }
    }
  };

  const getPlatoonName = (id: string) => data.platoons.find(p => p.id === id)?.name || 'Pelotão não encontrado';

  const filteredGarrisons = data.garrisons.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPlatoonName(g.platoonId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar escalas ou pelotões..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setEditingId(null); setIsModalOpen(true); }}
          className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 font-bold shadow-md transition-all active:scale-95 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Nova Escala
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold uppercase text-xs tracking-widest">Sincronizando Escalas...</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Unidade/VTR</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pelotão</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Regime</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Horário</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGarrisons.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{g.name}</td>
                    <td className="px-6 py-4 text-gray-600">{getPlatoonName(g.platoonId)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-[10px] font-black">{g.dutyType}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {g.startTime} às {g.endTime}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button onClick={() => openEditModal(g)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(g.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredGarrisons.map((g) => (
              <div key={g.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{g.name}</h3>
                    <p className="text-xs text-gray-500">{getPlatoonName(g.platoonId)}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black uppercase">{g.dutyType}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(g)} className="flex-1 flex items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-lg font-bold text-xs">Editar</button>
                  <button onClick={() => handleDelete(g.id)} className="flex-1 flex items-center justify-center py-2 text-red-600 bg-red-50 rounded-lg font-bold text-xs">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center">
                <Layers className="w-6 h-6 mr-3 text-amber-500" />
                <h2 className="text-lg font-bold uppercase">{editingId ? 'Editar Escala' : 'Nova Escala'}</h2>
              </div>
              <button onClick={closeModal} className="p-2"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Guarnição/VTR *</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: GATI" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Pelotão Responsável *</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={platoonId} onChange={(e) => setPlatoonId(e.target.value)}>
                      <option value="">Selecione um Pelotão</option>
                      {data.platoons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Regime de Serviço</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={dutyType} onChange={(e) => setDutyType(e.target.value as DutyType)}>
                      <option value={DutyType.STANDARD_1X3}>1x3 (24x72h)</option>
                      <option value={DutyType.STANDARD_48X144}>48x144h</option>
                      <option value={DutyType.COMPLEMENTARY}>Escala Complementar</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Hora Início</label>
                      <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase">Hora Fim</label>
                      <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                </div>

                {dutyType === DutyType.COMPLEMENTARY && (
                  <div className="bg-amber-50 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-black text-amber-700 uppercase">Datas da Operação</h4>
                    <div className="flex gap-2">
                      <input type="date" className="flex-1 px-3 py-2 bg-white text-sm border border-amber-200 rounded-lg outline-none" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                      <button onClick={handleAddDate} className="bg-amber-600 text-white px-3 rounded-lg hover:bg-amber-700"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {specificDates.map(d => (
                        <span key={d} className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center">
                          {d.split('-').reverse().join('/')}
                          <button onClick={() => handleRemoveDate(d)} className="ml-2 text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 flex flex-col min-h-[400px]">
                <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-xl">
                  {(['A', 'B', 'C', 'D'] as ActiveTeam[]).map(t => (
                    <button key={t} onClick={() => setActiveTeamTab(t)} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${activeTeamTab === t ? 'bg-amber-600 text-white shadow' : 'text-gray-500 hover:bg-gray-200'}`}>
                      EQUIPE {t}
                    </button>
                  ))}
                </div>

                <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white">
                  {dutyType !== DutyType.COMPLEMENTARY && (
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Início do Ciclo (Equipe {activeTeamTab}):</label>
                      <input type="date" className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none" value={(teams as any)[activeTeamTab].startDate} onChange={(e) => setTeams({...teams, [activeTeamTab]: {...(teams as any)[activeTeamTab], startDate: e.target.value}})} />
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
                    {data.officers.filter(o => o.isAvailable).map(o => {
                      const isSelectedInActive = (teams as any)[activeTeamTab].officerIds.includes(o.id);
                      const isSelectedInOtherTeam = (['A','B','C','D'] as ActiveTeam[]).some(t => t !== activeTeamTab && (teams as any)[t].officerIds.includes(o.id));
                      const alreadyAssigned = assignedOfficersMap.get(o.id);

                      return (
                        <button 
                          key={o.id} 
                          disabled={isSelectedInOtherTeam || !!alreadyAssigned} 
                          onClick={() => {
                            const currentTeam = (teams as any)[activeTeamTab];
                            const newIds = isSelectedInActive ? currentTeam.officerIds.filter((id: string) => id !== o.id) : [...currentTeam.officerIds, o.id];
                            setTeams({...teams, [activeTeamTab]: {...currentTeam, officerIds: newIds}});
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isSelectedInActive ? 'bg-amber-600 border-amber-700 text-white' : 'bg-white border-slate-100 hover:bg-slate-50'} ${(isSelectedInOtherTeam || alreadyAssigned) ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div>
                            <p className="text-[11px] font-black uppercase leading-tight">{o.rank} {o.warName}</p>
                            <p className="text-[9px] font-mono mt-0.5 opacity-60">{o.registration}</p>
                          </div>
                          {isSelectedInActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-slate-50">
              <button onClick={closeModal} className="flex-1 px-6 py-4 text-slate-500 font-bold bg-white border border-slate-200 rounded-xl">Cancelar</button>
              <button onClick={handleSaveGarrison} className="flex-[2] px-8 py-4 bg-slate-900 text-amber-500 rounded-xl font-black shadow-xl active:scale-95 transition-all uppercase">Publicar Escala</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
