
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle, FileUp, X, Check, Loader2 } from 'lucide-react';
import { loadData, upsertOfficer, deleteOfficer } from '../store';
import { Officer, Rank, UnavailabilityReason } from '../types';

export const OfficerView: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
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

  const refreshData = async () => {
    setLoading(true);
    const data = await loadData();
    // Normalização básica dos campos vindos do DB (snake_case para camelCase se necessário)
    // Aqui assumimos que a store já mapeou ou o BD está OK
    setOfficers(data.officers.map(o => ({
      ...o,
      fullName: (o as any).full_name || o.fullName,
      warName: (o as any).war_name || o.warName,
      isAvailable: (o as any).is_available ?? o.isAvailable,
      unavailabilityReason: (o as any).unavailability_reason || o.unavailabilityReason,
      customReason: (o as any).custom_reason || o.customReason
    })));
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSave = async () => {
    if (!fullName || !registration || !warName) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const newOfficer: any = {
        id: editingId || '',
        fullName,
        registration,
        rank,
        warName,
        isAvailable,
        unavailabilityReason: isAvailable ? UnavailabilityReason.NONE : unavailabilityReason,
        customReason: isAvailable ? '' : customReason
      };

      await upsertOfficer(newOfficer);
      await refreshData();
      closeModal();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('⚠ ATENÇÃO: Deseja realmente excluir este Policial?')) {
      try {
        await deleteOfficer(id);
        await refreshData();
      } catch (e: any) {
        alert('Erro ao deletar: ' + e.message);
      }
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
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors shadow-sm font-bold text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Cadastrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Sincronizando com Banco de Dados...</p>
        </div>
      ) : (
        <>
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
          </div>
        </>
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
              <button onClick={handleSave} className="flex-[2] md:flex-none px-8 py-3 bg-amber-600 text-white rounded-xl font-black shadow-lg shadow-amber-600/20 active:scale-95 transition-transform">SALVAR NO BANCO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
