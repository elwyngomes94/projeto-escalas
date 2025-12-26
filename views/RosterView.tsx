
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Shield, Users, ArrowRight, Info, X, Layers, Check, AlertCircle, Search, Edit2, Copy, Clock } from 'lucide-react';
import { loadData, saveData } from '../store';
import { Officer, Platoon, Garrison, DutyType, TeamConfig, TeamData } from '../types';

type ActiveTeam = 'A' | 'B' | 'C' | 'D';

const initialTeams: TeamConfig = {
  A: { officerIds: [], startDate: '' },
  B: { officerIds: [], startDate: '' },
  C: { officerIds: [], startDate: '' },
  D: { officerIds: [], startDate: '' }
};

export const RosterView: React.FC = () => {
  const [data, setData] = useState(loadData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<ActiveTeam>('A');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [platoonId, setPlatoonId] = useState('');
  const [teams, setTeams] = useState<TeamConfig>(initialTeams);
  const [dutyType, setDutyType] = useState<DutyType>(DutyType.STANDARD_1X3);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('07:00');

  useEffect(() => {
    setData(loadData());
  }, []);

  const assignedOfficersMap = React.useMemo(() => {
    const map = new Map<string, string>();
    data.garrisons.forEach(g => {
      if (g.id === editingId) return;
      [...g.teams.A.officerIds, ...g.teams.B.officerIds, ...g.teams.C.officerIds, ...g.teams.D.officerIds].forEach(id => {
        map.set(id, g.name);
      });
    });
    return map;
  }, [data.garrisons, editingId]);

  const handleSaveGarrison = () => {
    if (!name || !platoonId) {
      alert('Preencha Nome e Pelotão.');
      return;
    }

    if (dutyType !== DutyType.COMPLEMENTARY) {
      const hasDates = teams.A.startDate || teams.B.startDate || teams.C.startDate || teams.D.startDate;
      if (!hasDates) {
        alert('Defina ao menos uma data de início para uma das equipes.');
        return;
      }
    } else {
      if (specificDates.length === 0) {
        alert('Adicione ao menos uma data para a escala complementar.');
        return;
      }
    }

    const currentData = loadData();
    const newGarrison: Garrison = {
      id: editingId || Date.now().toString(),
      name,
      platoonId,
      teams,
      dutyType,
      specificDates: dutyType === DutyType.COMPLEMENTARY ? specificDates : [],
      startTime,
      endTime
    };

    let updatedGarrisons;
    if (editingId) {
      updatedGarrisons = currentData.garrisons.map(g => g.id === editingId ? newGarrison : g);
    } else {
      updatedGarrisons = [...currentData.garrisons, newGarrison];
    }

    const newData = { ...currentData, garrisons: updatedGarrisons };
    saveData(newData);
    setData(newData);
    closeModal();
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

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta escala completa?')) {
      const currentData = loadData();
      const updated = currentData.garrisons.filter(g => g.id !== id);
      const newData = { ...currentData, garrisons: updated };
      saveData(newData);
      setData(newData);
    }
  };

  const getPlatoonName = (id: string) => data.platoons.find(p => p.id === id)?.name || 'N/A';

  const filteredGarrisons = data.garrisons.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPlatoonName(g.platoonId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar escalas..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center justify-center bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Nova Escala
          </button>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
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
                    {g.startTime || '07:00'} às {g.endTime || '07:00'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(g)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredGarrisons.map((g) => (
          <div key={g.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-900">{g.name}</h3>
                <p className="text-xs text-gray-500">{getPlatoonName(g.platoonId)}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {g.startTime || '07:00'} - {g.endTime || '07:00'}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black uppercase">{g.dutyType}</span>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => openEditModal(g)} className="flex-1 flex items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-lg font-bold text-xs">
                <Edit2 className="w-3 h-3 mr-2" /> Editar
              </button>
              <button onClick={() => handleDelete(g.id)} className="flex-1 flex items-center justify-center py-2 text-red-600 bg-red-50 rounded-lg font-bold text-xs">
                <Trash2 className="w-3 h-3 mr-2" /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

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

            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-4 space-y-6 lg:border-r lg:border-gray-100 lg:pr-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Guarnição/VTR</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: GATI" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Pelotão</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={platoonId} onChange={(e) => setPlatoonId(e.target.value)}>
                      <option value="">Selecione...</option>
                      {data.platoons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Tipo de Escala</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={dutyType} onChange={(e) => setDutyType(e.target.value as DutyType)}>
                      <option value={DutyType.STANDARD_1X3}>1x3 (24x72h)</option>
                      <option value={DutyType.STANDARD_48X144}>48x144h</option>
                      <option value={DutyType.COMPLEMENTARY}>Complementar</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Início</label>
                      <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Fim</label>
                      <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                </div>

                {dutyType === DutyType.COMPLEMENTARY ? (
                  <div className="bg-amber-50 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-black text-amber-700 uppercase">Datas Complementares</h4>
                    <div className="flex gap-2">
                      <input type="date" className="flex-1 px-3 py-2 bg-white text-sm border border-amber-200 rounded-lg outline-none" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                      <button onClick={handleAddDate} className="bg-amber-600 text-white px-3 rounded-lg hover:bg-amber-700 active:scale-95"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {specificDates.map(d => (
                        <span key={d} className="bg-white px-2 py-1.5 rounded-lg text-[10px] font-bold border border-amber-200 flex items-center shadow-sm">
                          {d.split('-').reverse().join('/')}
                          <button onClick={() => handleRemoveDate(d)} className="ml-2 text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-inner">
                    <h4 className="text-[10px] font-black text-amber-500 uppercase mb-3 border-b border-slate-800 pb-2">Status Equipes</h4>
                    <div className="space-y-3 text-[11px] font-bold">
                      {['A', 'B', 'C', 'D'].map(t => (
                        <div key={t} className="flex justify-between items-center text-slate-400 group">
                          <span className="uppercase tracking-widest">Equipe {t}:</span>
                          <span className={`${(teams as any)[t].startDate ? 'text-white' : 'text-slate-600'} italic`}>
                            {(teams as any)[t].startDate ? (teams as any)[t].startDate.split('-').reverse().join('/') : 'Não agendada'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 flex flex-col min-h-[400px]">
                <div className="flex space-x-1 mb-4 bg-gray-100 p-1.5 rounded-2xl shrink-0">
                  {(['A', 'B', 'C', 'D'] as ActiveTeam[]).map(t => (
                    <button key={t} onClick={() => setActiveTeamTab(t)} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${activeTeamTab === t ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex-1 border-2 border-slate-100 rounded-3xl overflow-hidden flex flex-col bg-white">
                  {dutyType !== DutyType.COMPLEMENTARY && (
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center">
                         <Calendar className="w-4 h-4 mr-2 text-amber-600" />
                         <label className="text-[10px] font-black text-slate-500 uppercase">Início da Equipe {activeTeamTab}:</label>
                      </div>
                      <input type="date" className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" value={(teams as any)[activeTeamTab].startDate} onChange={(e) => setTeams({...teams, [activeTeamTab]: {...(teams as any)[activeTeamTab], startDate: e.target.value}})} />
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start min-h-[250px]">
                    {data.officers.filter(o => o.isAvailable).map(o => {
                      const isSelectedInActive = (teams as any)[activeTeamTab].officerIds.includes(o.id);
                      const isSelectedInOtherTeam = (['A','B','C','D'] as ActiveTeam[]).some(t => t !== activeTeamTab && (teams as any)[t].officerIds.includes(o.id));
                      const assignedInOtherGarrison = assignedOfficersMap.get(o.id);

                      return (
                        <button key={o.id} disabled={isSelectedInOtherTeam || !!assignedInOtherGarrison} onClick={() => {
                          const currentTeam = (teams as any)[activeTeamTab];
                          const newIds = isSelectedInActive ? currentTeam.officerIds.filter((id: string) => id !== o.id) : [...currentTeam.officerIds, o.id];
                          setTeams({...teams, [activeTeamTab]: {...currentTeam, officerIds: newIds}});
                        }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelectedInActive ? 'bg-amber-600 border-amber-700 text-white shadow-lg scale-[0.98]' : 'bg-white border-slate-100 active:bg-slate-50'} ${(isSelectedInOtherTeam || assignedInOtherGarrison) ? 'opacity-30 grayscale cursor-not-allowed bg-slate-50' : ''}`}>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-black uppercase leading-tight">{o.rank} {o.warName}</span>
                            <span className={`text-[9px] font-mono mt-1 ${isSelectedInActive ? 'text-amber-100' : 'text-slate-400'}`}>{o.registration}</span>
                          </div>
                          {isSelectedInActive ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4 text-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 flex gap-3 bg-slate-50 shrink-0">
              <button onClick={closeModal} className="flex-1 px-6 py-4 text-slate-500 font-bold bg-white border border-slate-200 rounded-2xl">Cancelar</button>
              <button onClick={handleSaveGarrison} className="flex-[2] px-8 py-4 bg-slate-900 text-amber-500 rounded-2xl hover:bg-slate-800 font-black shadow-xl active:scale-95 transition-transform">
                PUBLICAR ESCALA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
