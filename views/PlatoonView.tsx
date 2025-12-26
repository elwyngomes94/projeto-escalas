
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Shield, User } from 'lucide-react';
// Fix: Removed saveData and imported granular upsert and delete functions
import { loadData, upsertPlatoon, deletePlatoon } from '../store';
import { Platoon, Officer } from '../types';

export const PlatoonView: React.FC = () => {
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [allOfficers, setAllOfficers] = useState<Officer[]>([]); // Added for commander name lookup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [commanderId, setCommanderId] = useState('');

  // Fix: Wrapped data loading in an async function inside useEffect to handle Promise
  const refreshData = async () => {
    const data = await loadData();
    // Normalizing properties from snake_case if necessary
    const normalizedPlatoons = data.platoons.map((p: any) => ({
      ...p,
      commanderId: p.commander_id || p.commanderId
    }));
    const normalizedOfficers = data.officers.map((o: any) => ({
      ...o,
      rank: o.rank,
      warName: o.war_name || o.warName,
      isAvailable: o.is_available ?? o.isAvailable,
      registration: o.registration
    }));
    
    setPlatoons(normalizedPlatoons);
    setAllOfficers(normalizedOfficers);
    setOfficers(normalizedOfficers.filter(o => o.isAvailable));
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Fix: handleSave is now async and uses upsertPlatoon
  const handleSave = async () => {
    if (!name || !city || !commanderId) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const newPlatoon: Platoon = {
      id: editingId || Date.now().toString(),
      name,
      city,
      commanderId
    };

    try {
      await upsertPlatoon(newPlatoon);
      await refreshData();
      closeModal();
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    }
  };

  // Fix: handleDelete is now async and uses deletePlatoon
  const handleDelete = async (id: string) => {
    if (confirm('⚠ ATENÇÃO: Deseja realmente excluir este Pelotão?\n\nTodas as escalas (guarnições) vinculadas a este pelotão também serão removidas permanentemente.')) {
      try {
        await deletePlatoon(id);
        await refreshData();
        alert('Pelotão e escalas associadas removidos com sucesso.');
      } catch (e: any) {
        alert('Erro ao excluir: ' + e.message);
      }
    }
  };

  const openModal = (platoon?: Platoon) => {
    if (platoon) {
      setEditingId(platoon.id);
      setName(platoon.name);
      setCity(platoon.city);
      setCommanderId(platoon.commanderId);
    } else {
      setEditingId(null);
      setName('');
      setCity('');
      setCommanderId('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Fix: Updated to look up commander name from state instead of re-loading data synchronously
  const getCommanderName = (id: string) => {
    const officer = allOfficers.find(o => o.id === id);
    return officer ? `${officer.rank} ${officer.warName}` : 'Não definido';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Pelotão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platoons.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {p.city}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium text-gray-800">Cmd: {getCommanderName(p.commanderId)}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">ID: {p.id.slice(-6).toUpperCase()}</span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Ativo</span>
            </div>
          </div>
        ))}

        {platoons.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
            <Shield className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">Nenhum pelotão cadastrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Pelotão' : 'Novo Pelotão'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Nome do Pelotão *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 1º Pelotão de Patrulha Rural"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Cidade de Atuação *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Porto Alegre"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Comandante *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={commanderId}
                  onChange={(e) => setCommanderId(e.target.value)}
                >
                  <option value="">Selecione um Comandante</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.rank} {o.warName} ({o.registration})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Apenas policiais com status "Disponível" aparecem nesta lista.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold"
              >
                Salvar Pelotão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
