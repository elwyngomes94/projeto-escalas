
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle, FileUp, X, Check, Loader2, Database, ClipboardPaste, ListFilter } from 'lucide-react';
import { loadData, upsertOfficer, deleteOfficer } from '../store';
import { Officer, Rank, UnavailabilityReason } from '../types';

export const OfficerView: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Import State
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);

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
    setOfficers(data.officers);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const mapRank = (rankStr: string): Rank => {
    const cleanRank = rankStr?.trim().toUpperCase() || '';
    if (cleanRank.includes('TEN.CEL') || cleanRank.includes('TC')) return Rank.TC;
    if (cleanRank.includes('MAJ')) return Rank.MAJ;
    if (cleanRank.includes('CAP')) return Rank.CAP;
    if (cleanRank.includes('1º TEN') || cleanRank.includes('1ºTEN')) return Rank.TEN1;
    if (cleanRank.includes('2º TEN') || cleanRank.includes('2ºTEN') || cleanRank.includes('2 TEN')) return Rank.TEN2;
    if (cleanRank.includes('ST') || cleanRank.includes('SUB')) return Rank.SUB;
    if (cleanRank.includes('1º SGT') || cleanRank.includes('1ºSGT')) return Rank.SGT1;
    if (cleanRank.includes('2º SGT') || cleanRank.includes('2ºSGT') || cleanRank.includes('2ª SGT') || cleanRank.includes("2'º SGT")) return Rank.SGT2;
    if (cleanRank.includes('3º SGT') || cleanRank.includes('3ºSGT')) return Rank.SGT3;
    if (cleanRank.includes('CB')) return Rank.CB;
    if (cleanRank.includes('SD')) return Rank.SD;
    return Rank.SD;
  };

  // Analisa o texto colado para gerar um preview
  const analyzeImportText = () => {
    const lines = importText.trim().split('\n');
    const preview: any[] = [];

    lines.forEach(line => {
      // Tenta separar por Tab, se não encontrar tenta por múltiplos espaços
      let parts = line.split('\t').map(p => p.trim());
      if (parts.length < 2) {
        parts = line.split(/\s{2,}/).map(p => p.trim());
      }
      
      // Se ainda não tiver partes suficientes, pula o cabeçalho ou linhas inválidas
      if (parts.length < 3) return;
      if (parts[0].toUpperCase().includes('NOME DE GUERRA')) return;

      const warNamePart = parts[0];
      const regPart = parts[1]?.replace(/[^\d]/g, ''); // Remove tudo que não é número
      const rankPart = parts[2];
      const fullNamePart = parts[3] || parts[0];

      if (regPart && fullNamePart) {
        preview.push({
          warName: warNamePart,
          registration: regPart,
          rank: mapRank(rankPart),
          fullName: fullNamePart,
          status: officers.some(o => o.registration === regPart) ? 'update' : 'new'
        });
      }
    });

    setImportPreview(preview);
  };

  useEffect(() => {
    if (importText) analyzeImportText();
    else setImportPreview([]);
  }, [importText, officers]);

  const handleProcessImport = async () => {
    if (importPreview.length === 0) return;
    
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of importPreview) {
      try {
        const officer: any = {
          id: '', 
          fullName: item.fullName,
          registration: item.registration,
          rank: item.rank,
          warName: item.warName,
          isAvailable: true,
          unavailabilityReason: UnavailabilityReason.NONE,
          customReason: ''
        };
        await upsertOfficer(officer);
        successCount++;
      } catch (e) {
        console.error('Erro:', item.fullName, e);
        errorCount++;
      }
    }

    setIsImporting(false);
    setIsImportModalOpen(false);
    setImportText('');
    alert(`Importação concluída!\nSucesso: ${successCount}\nErros: ${errorCount}`);
    refreshData();
  };

  const handleSave = async () => {
    if (!fullName || !registration || !warName) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const newOfficer: any = {
        id: editingId || '',
        fullName,
        registration: registration.replace(/[^\d]/g, ''),
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
          <div className="flex gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm"
            >
              <Database className="w-4 h-4 mr-2" /> Importar Lista
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors shadow-sm font-bold text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Cadastrar
            </button>
          </div>
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

      {/* Modal de Importação em Lote */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center">
                <Database className="w-6 h-6 mr-3 text-amber-500" />
                <div>
                  <h2 className="text-xl font-bold">Importação de Efetivo</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Colagem Direta de Lista Oficial</p>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Área de Colagem */}
              <div className="lg:w-1/2 p-6 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100">
                <div className="space-y-1">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center">
                      <ClipboardPaste className="w-4 h-4 mr-1" /> Cole aqui os dados (Excel/Tab)
                    </label>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">NOME MATRÍCULA POSTO COMPLETO</span>
                  </div>
                  <textarea
                    className="w-full h-64 lg:h-full p-4 bg-slate-50 border border-gray-200 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Exemplo:&#10;CRISTOVÃO  1021230  TEN.CEL  CRISTOVÃO ISAAC&#10;EDVAN  9807721  CAP  EDVAN ARRUDA"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                </div>
              </div>

              {/* Área de Preview */}
              <div className="lg:w-1/2 p-6 flex flex-col bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase flex items-center">
                    <ListFilter className="w-4 h-4 mr-2" /> Pré-visualização ({importPreview.length})
                  </h3>
                  {importPreview.length > 0 && (
                     <div className="flex gap-2">
                        <span className="flex items-center text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                          <Plus className="w-3 h-3 mr-1" /> {importPreview.filter(p => p.status === 'new').length} NOVOS
                        </span>
                        <span className="flex items-center text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          <Edit2 className="w-3 h-3 mr-1" /> {importPreview.filter(p => p.status === 'update').length} ATUALIZAR
                        </span>
                     </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {importPreview.length > 0 ? (
                    importPreview.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                             {idx + 1}
                           </div>
                           <div>
                             <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{item.rank} {item.warName}</p>
                             <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.fullName}</p>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono font-bold text-slate-400">{item.registration}</p>
                          <span className={`text-[8px] font-black uppercase ${item.status === 'new' ? 'text-green-600' : 'text-blue-600'}`}>
                            {item.status === 'new' ? 'Novo Registro' : 'Já Cadastrado'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                      <AlertCircle className="w-12 h-12 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest text-center px-10">
                        Os dados processados aparecerão aqui para conferência antes de salvar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
              <button
                disabled={importPreview.length === 0 || isImporting}
                onClick={handleProcessImport}
                className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-600/20 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
              >
                {isImporting ? (
                  <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> PROCESSANDO...</span>
                ) : (
                  <span className="flex items-center"><Check className="w-5 h-5 mr-2" /> CONFIRMAR E IMPORTAR</span>
                )}
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
              <button onClick={handleSave} className="flex-[2] md:flex-none px-8 py-3 bg-amber-600 text-white rounded-xl font-black shadow-lg shadow-amber-600/20 active:scale-95 transition-transform">SALVAR NO BANCO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
