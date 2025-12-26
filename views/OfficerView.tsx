
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle, FileUp, X, Check } from 'lucide-react';
import { loadData, saveData } from '../store';
import { Officer, Rank, UnavailabilityReason } from '../types';

export const OfficerView: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [registration, setRegistration] = useState('');
  const [rank, setRank] = useState<Rank>(Rank.SD);
  const [warName, setWarName] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [unavailabilityReason, setUnavailabilityReason] = useState<UnavailabilityReason>(UnavailabilityReason.NONE);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    const data = loadData();
    setOfficers(data.officers);
  }, []);

  const mapRank = (raw: string): Rank => {
    const r = raw.toUpperCase().replace(/\./g, '').replace(/'/g, '').trim();
    if (r.includes('TEN CEL')) return Rank.TC;
    if (r.includes('MAJ')) return Rank.MAJ;
    if (r.includes('CAP')) return Rank.CAP;
    if (r.includes('1 TEN') || r.includes('1º TEN')) return Rank.TEN1;
    if (r.includes('2 TEN') || r.includes('2º TEN')) return Rank.TEN2;
    if (r.includes('ASP')) return Rank.ASP;
    if (r.includes('ST') || r.includes('SUB')) return Rank.SUB;
    if (r.includes('1 SGT') || r.includes('1º SGT')) return Rank.SGT1;
    if (r.includes('2 SGT') || r.includes('2º SGT') || r.includes('2ª SGT')) return Rank.SGT2;
    if (r.includes('3 SGT') || r.includes('3º SGT') || r.includes('3ºSGT')) return Rank.SGT3;
    if (r.includes('CB')) return Rank.CB;
    if (r.includes('SD')) return Rank.SD;
    return Rank.SD;
  };

  const handleBulkImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const data = loadData();
    const currentOfficers = [...data.officers];
    let addedCount = 0;

    lines.forEach(line => {
      if (!line.trim()) return;
      
      let parts = line.split('\t');
      if (parts.length < 3) parts = line.split(/\s{2,}/);
      if (parts.length < 3) parts = line.split(/\s/);

      if (parts.length >= 3) {
        const warNameRaw = parts[0]?.trim();
        const regRaw = parts[1]?.trim().replace(/-/g, '').replace(/\s/g, '');
        const rankRaw = parts[2]?.trim();
        const fullNameRaw = parts[3]?.trim() || warNameRaw;

        if (!currentOfficers.some(o => o.registration === regRaw)) {
          currentOfficers.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            warName: warNameRaw,
            registration: regRaw,
            rank: mapRank(rankRaw),
            fullName: fullNameRaw,
            isAvailable: true,
            unavailabilityReason: UnavailabilityReason.NONE
          });
          addedCount++;
        }
      }
    });

    const newData = { ...data, officers: currentOfficers };
    saveData(newData);
    setOfficers(currentOfficers);
    alert(`${addedCount} novos militares importados com sucesso.`);
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleSave = () => {
    if (!fullName || !registration || !warName) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const data = loadData();
    const existing = data.officers.find(o => o.registration === registration && o.id !== editingId);
    if (existing) {
      alert('Matrícula já cadastrada no sistema.');
      return;
    }

    const newOfficer: Officer = {
      id: editingId || Date.now().toString(),
      fullName,
      registration,
      rank,
      warName,
      isAvailable,
      unavailabilityReason: isAvailable ? UnavailabilityReason.NONE : unavailabilityReason,
      customReason: isAvailable ? '' : customReason
    };

    let updated;
    if (editingId) {
      updated = data.officers.map(o => o.id === editingId ? newOfficer : o);
    } else {
      updated = [...data.officers, newOfficer];
    }

    const newData = { ...data, officers: updated };
    saveData(newData);
    setOfficers(updated);
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠ ATENÇÃO: Deseja realmente excluir este Policial?')) {
      const data = loadData();
      const updatedPlatoons = data.platoons.map(p => p.commanderId === id ? { ...p, commanderId: '' } : p);
      
      const updatedGarrisons = data.garrisons.map(g => ({
        ...g,
        teams: {
          A: { ...g.teams.A, officerIds: g.teams.A.officerIds.filter(oid => oid !== id) },
          B: { ...g.teams.B, officerIds: g.teams.B.officerIds.filter(oid => oid !== id) },
          C: { ...g.teams.C, officerIds: g.teams.C.officerIds.filter(oid => oid !== id) },
          D: { ...g.teams.D, officerIds: g.teams.D.officerIds.filter(oid => oid !== id) },
        }
      }));

      const updatedOfficers = data.officers.filter(o => o.id !== id);
      const newData = { ...data, officers: updatedOfficers, platoons: updatedPlatoons, garrisons: updatedGarrisons };
      saveData(newData);
      setOfficers(updatedOfficers);
    }
  };

  const openModal = (officer?: Officer) => {
    if (officer) {
      setEditingId(officer.id);
      setFullName(officer.fullName);
      setRegistration(officer.registration);
      setRank(officer.rank);
      setWarName(officer.warName);
      setIsAvailable(officer.isAvailable);
      setUnavailabilityReason(officer.unavailabilityReason || UnavailabilityReason.NONE);
      setCustomReason(officer.customReason || '');
    } else {
      setEditingId(null);
      setFullName('');
      setRegistration('');
      setRank(Rank.SD);
      setWarName('');
      setIsAvailable(true);
      setUnavailabilityReason(UnavailabilityReason.NONE);
      setCustomReason('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredOfficers = officers.filter(o => 
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.warName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.registration.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou matrícula..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Importar
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors shadow-sm font-bold text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Posto/Grad</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome de Guerra</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Matrícula</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOfficers.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">{o.rank}</td>
                  <td className="px-6 py-4 text-gray-700">{o.warName}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{o.registration}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${o.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {o.isAvailable ? 'Disponível' : 'Afastado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => openModal(o)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(o.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredOfficers.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{o.rank}</p>
                <h3 className="text-base font-bold text-gray-900">{o.warName}</h3>
                <p className="text-xs font-mono text-gray-500">{o.registration}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${o.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {o.isAvailable ? 'Disponível' : 'Afastado'}
              </span>
            </div>
            <div className="flex border-t border-gray-50 pt-3 gap-2">
              <button onClick={() => openModal(o)} className="flex-1 flex items-center justify-center py-2 text-blue-600 bg-blue-50 rounded-lg font-bold text-xs">
                <Edit2 className="w-3 h-3 mr-2" /> Editar
              </button>
              <button onClick={() => handleDelete(o.id)} className="flex-1 flex items-center justify-center py-2 text-red-600 bg-red-50 rounded-lg font-bold text-xs">
                <Trash2 className="w-3 h-3 mr-2" /> Excluir
              </button>
            </div>
          </div>
        ))}
        {filteredOfficers.length === 0 && (
          <div className="text-center py-8 text-gray-400">Nenhum militar encontrado.</div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center">
                <FileUp className="w-6 h-6 mr-3 text-amber-500" />
                <h2 className="text-lg md:text-xl font-bold uppercase">Importação em Massa</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400 text-xs md:text-sm text-amber-800">
                Cole a lista no formato: <strong>GUERRA MATRÍCULA POSTO NOME_COMPLETO</strong>
              </div>
              <textarea
                className="w-full h-64 md:h-80 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono text-[11px] leading-relaxed resize-none outline-none"
                placeholder="Exemplo:&#10;CRISTOVÃO 1021230 TEN.CEL CRISTOVÃO RODRIGUES&#10;EDVAN 9807721 CAP EDVAN ARRUDA"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 md:rounded-b-2xl">
              <button onClick={() => setIsImportModalOpen(false)} className="flex-1 md:flex-none px-6 py-3 font-bold text-gray-500">Cancelar</button>
              <button onClick={handleBulkImport} className="flex-[2] md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-black flex items-center justify-center shadow-lg">
                <Check className="w-5 h-5 mr-2" /> PROCESSAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Policial' : 'Novo Policial'}</h2>
              <button onClick={closeModal} className="md:hidden p-2 text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Matrícula *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500" value={registration} onChange={(e) => setRegistration(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Posto / Graduação *</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500" value={rank} onChange={(e) => setRank(e.target.value as Rank)}>
                    {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nome de Guerra *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500" value={warName} onChange={(e) => setWarName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl">
                  <input type="checkbox" id="isAvailable" className="w-6 h-6 text-amber-600 rounded-md" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                  <label htmlFor="isAvailable" className="text-sm font-bold text-amber-900 select-none">Disponível para Escala?</label>
                </div>
                {!isAvailable && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Motivo do Afastamento</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500" value={unavailabilityReason} onChange={(e) => setUnavailabilityReason(e.target.value as UnavailabilityReason)}>
                      {Object.values(UnavailabilityReason).filter(r => r !== UnavailabilityReason.NONE).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button onClick={closeModal} className="flex-1 md:flex-none px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 bg-white shadow-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] md:flex-none px-8 py-3 bg-amber-600 text-white rounded-xl font-black shadow-lg shadow-amber-600/20 active:scale-95 transition-transform">SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
