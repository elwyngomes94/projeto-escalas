
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Shield, Users, ArrowRight, Info, X, Layers, Check, AlertCircle, Search, Edit2, Copy } from 'lucide-react';
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

    const hasDates = teams.A.startDate || teams.B.startDate || teams.C.startDate || teams.D.startDate;
    if (!hasDates) {
      alert('Defina ao menos uma data de início para uma das equipes.');
      return;
    }

    const currentData = loadData();
    const newGarrison: Garrison = {
      id: editingId || Date.now().toString(),
      name,
      platoonId,
      teams,
      dutyType
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

  const handleDuplicate = (garrison: Garrison) => {
    if (confirm(`Deseja criar uma cópia exata da guarnição "${garrison.name}"?`)) {
      const currentData = loadData();
      const duplicate: Garrison = {
        ...garrison,
        id: Date.now().toString(),
        name: `${garrison.name} (Cópia)`
      };
      const newData = { ...currentData, garrisons: [...currentData.garrisons, duplicate] };
      saveData(newData);
      setData(newData);
      alert('Cópia realizada com sucesso!');
    }
  };

  const toggleOfficerInTeam = (officerId: string) => {
    setTeams(prev => {
      const currentTeam = prev[activeTeamTab];
      const isSelected = currentTeam.officerIds.includes(officerId);
      
      return {
        ...prev,
        [activeTeamTab]: {
          ...currentTeam,
          officerIds: isSelected 
            ? currentTeam.officerIds.filter(id => id !== officerId) 
            : [...currentTeam.officerIds, officerId]
        }
      };
    });
  };

  const handleTeamDateChange = (date: string) => {
    setTeams(prev => ({
      ...prev,
      [activeTeamTab]: {
        ...prev[activeTeamTab],
        startDate: date
      }
    }));
  };

  const openEditModal = (garrison: Garrison) => {
    setEditingId(garrison.id);
    setName(garrison.name);
    setPlatoonId(garrison.platoonId);
    setTeams(garrison.teams);
    setDutyType(garrison.dutyType);
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
    setActiveTeamTab('A');
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

  const filteredGarrisons = data.garrisons.filter(g => {
    const pName = getPlatoonName(g.platoonId).toLowerCase();
    const gName = g.name.toLowerCase();
    const search = searchTerm.toLowerCase();
    return gName.includes(search) || pName.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Escalas</h2>
          <p className="text-sm text-gray-500">Configure as 4 equipes com datas de início individuais.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar guarnição..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="flex items-center justify-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-bold shadow-md transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Nova Escala
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Unidade/VTR</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pelotão</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Regime</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Efetivo</th>
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
                  <td className="px-6 py-4 text-sm font-medium">
                    {g.teams.A.officerIds.length + g.teams.B.officerIds.length + g.teams.C.officerIds.length + g.teams.D.officerIds.length} Mils.
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleDuplicate(g)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Duplicar (Copiar Documento)"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => openEditModal(g)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-700">
            <div className="p-6 border-b border-gray-100 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center">
                <Layers className="w-6 h-6 mr-3 text-amber-500" />
                <div>
                  <h2 className="text-xl font-bold uppercase">{editingId ? 'Editar Escala' : 'Configurar Escala'}</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Datas Individuais por Equipe</p>
                </div>
              </div>
              <button onClick={closeModal}><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6 border-r border-gray-100 pr-8">
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase">Identificação da Guarnição</label>
                    <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg font-bold" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: GATI" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase">Pelotão Vinculado</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg font-bold" value={platoonId} onChange={(e) => setPlatoonId(e.target.value)}>
                      <option value="">Selecione...</option>
                      {data.platoons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase">Regime de Serviço</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg font-bold" value={dutyType} onChange={(e) => setDutyType(e.target.value as DutyType)}>
                      <option value={DutyType.STANDARD_1X3}>1x3 (24x72h)</option>
                      <option value={DutyType.STANDARD_48X144}>48x144h</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl text-white shadow-inner">
                  <h4 className="text-xs font-black text-amber-500 uppercase mb-2">Datas de Início</h4>
                  <div className="space-y-2 text-[11px] font-bold">
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Equipe A:</span> <span>{teams.A.startDate || 'Não definida'}</span></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Equipe B:</span> <span>{teams.B.startDate || 'Não definida'}</span></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Equipe C:</span> <span>{teams.C.startDate || 'Não definida'}</span></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Equipe D:</span> <span>{teams.D.startDate || 'Não definida'}</span></div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col h-full">
                <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-xl">
                  {(['A', 'B', 'C', 'D'] as ActiveTeam[]).map(t => (
                    <button key={t} onClick={() => setActiveTeamTab(t)} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${activeTeamTab === t ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}>
                      EQUIPE {t}
                    </button>
                  ))}
                </div>

                <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white">
                  <div className="p-4 border-b border-gray-100 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Configuração da EQUIPE {activeTeamTab}</span>
                      <span className="text-[10px] font-black text-amber-600">{teams[activeTeamTab].officerIds.length} Policiais</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase">Início desta Equipe:</label>
                      <input 
                        type="date" 
                        className="px-3 py-1 border border-gray-300 rounded text-xs font-bold" 
                        value={teams[activeTeamTab].startDate} 
                        onChange={(e) => handleTeamDateChange(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2 content-start">
                    {data.officers.filter(o => o.isAvailable).map(o => {
                      const isSelectedInActive = teams[activeTeamTab].officerIds.includes(o.id);
                      const isSelectedInOtherTeam = (['A','B','C','D'] as ActiveTeam[]).some(t => t !== activeTeamTab && teams[t].officerIds.includes(o.id));
                      const assignedInOtherGarrison = assignedOfficersMap.get(o.id);

                      return (
                        <button key={o.id} disabled={isSelectedInOtherTeam || !!assignedInOtherGarrison} onClick={() => toggleOfficerInTeam(o.id)}
                          className={`group flex items-center justify-between p-3 rounded-xl text-left transition-all border ${isSelectedInActive ? 'bg-amber-600 border-amber-700 text-white shadow-md' : 'bg-white border-gray-100 hover:border-amber-300'} ${(isSelectedInOtherTeam || assignedInOtherGarrison) ? 'opacity-40 grayscale cursor-not-allowed bg-gray-50' : ''}`}>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase leading-tight">{o.rank} {o.warName}</span>
                            <span className={`text-[9px] ${isSelectedInActive ? 'text-amber-100' : 'text-gray-400'} font-mono`}>{o.registration}</span>
                            {assignedInOtherGarrison && !isSelectedInActive && <span className="text-[8px] text-red-600 font-black uppercase mt-1 flex items-center"><AlertCircle className="w-2 h-2 mr-1" /> JÁ ESCALADO</span>}
                          </div>
                          {isSelectedInActive && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
              <button onClick={closeModal} className="px-6 py-2 text-gray-500 font-bold">Cancelar</button>
              <button onClick={handleSaveGarrison} className="px-10 py-3 bg-slate-900 text-amber-500 rounded-xl hover:bg-slate-800 font-black shadow-xl flex items-center transform transition-transform active:scale-95">
                {editingId ? 'ATUALIZAR' : 'PUBLICAR'} <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
