
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle, FileUp, X, Check, Loader2, Database } from 'lucide-react';
import { loadData, upsertOfficer, deleteOfficer } from '../store';
import { Officer, Rank, UnavailabilityReason } from '../types';

// Lista oficial fornecida pelo usuário para importação em lote
const OFFICIAL_LIST_RAW = `CRISTOVÃO	1021230	TEN.CEL	CRISTOVÃO ISAAC RODRIGUES MAGALHÃES
EDVAN	9807721	CAP	EDVAN ARRUDA FERRAZ
MYKE	119793 2	2º TEN	JOSEPH MYKE DA SILVA
TAVARES	1260782	2º TEN	PAULO HENRIQUE DA SILVA TAVARES
HUMBERTO	1260790	2º TEN	HUMBERTO VICTOR ALBUQUERQUE DE VASCONCELOS
RONALDO	9504001	119793- 2	RONALDO DO NASCIMENTO LOPES
E. PEREIRA	1030434	ST	EDINALDO PEREIRA DA SILVA
BERREDO	1055275	ST	DOALCEY BERREDO VILANOVA DOS SANTOS
EDMAR	1056190	1º SGT	EDMAR PEREIRA DA SILVA FILHO
OSMILAN	1031554	ST	OSMILAN SOARES DA SILVA
JAIRO	9210580	2º SGT	JAIRO GOMES LOPES
NASCIMENTO	9900977	2º SGT	FRANCISCO DE ASSIS DO NASCIMENTO
ANDRADE	9210431	2º SGT	FRANCISCO JOSÉ ALENCAR ANDRADE
TEÓFILO	9210520	2º SGT	TEÓFILO CESARIO DA SILVA
EUDES	9400303	2º SGT	EUDES VITO ARAUJO
WILDES	9403191	2º SGT	CARLOS WILDES DA SILVA FILHO
CALDEIRA	9403116	2º SGT	EDSON CALDEIRA DA SILVA
TOMAZ	1063863	2º SGT	SAMUEL TOMAZ SANTOS DE JESUS
NERI	9807080	2'º SGT	SILVANIO NERI DA SILVA
ERIVAN	1053817	2º SGT	JOSE ERIVAN LIMA SILVINO
ERONILDO	1064720	2º SGT	JACKSON ERONILDO NUNES DE SOUZA
PRISCILA	1074636	3º SGT	PRISCILA RAQUEL TORRES CIPRIANO DA SILVA
KLEBER	1070517	2º SGT	KLEBER DE SOUSA BATISTA
DEYWD	1076434	3º SGT	DEYWD ALEXANDRE TEIXEIRA SARAIVA
ERIVANO	1077007	3º SGT	ERIVANO FRANCISCO DE OLIVEIRA
JEFFERSON	1079700	3ºSGT	JEFFERSON THIAGO CIPRIANO DA SILVA
DUARTE SOUZA	1065432	3º SGT	WASHINTON ANTONIO DUARTE DE SOUZA
P. JACINTO	1092901	3º SGT	FRANCISCO PEREIRA JACINTO
MOTA	1101471	3º SGT	ANDERSON MOTA DOS SANTOS
SILVA SOUZA	1105000	3º SGT	FABIO DA SILVA SOUZA
EWERTON	1077899	3º SGT	EWERTON FERINO CARNEIRO
CICERO ROCHA	1098500	3º SGT	CICERO HELYSON ROCHA DOS SANTOS
GICLAUDIO	1101307	3º SGT	GICLAUDIO DA SILVA PEREIRA
RODRIGUES SOUZA	1103512	3º SGT	WASHINGTON RODRIGUES DE SOUZA
C. HOLANDA	1111612	3º SGT	CICERO CLEMENTINO DE HOLANDA
EDNO	1094262	3º SGT	EDNO PEREIRA DE LIMA
CARLOS	1090534	3º SGT	CARLOS ANTONIO NOVAES PEREIRA
MAYKE	1093770	3º SGT	MAYKE DA SILVA PIRES
FÁBIO COELHO	1112104	CB	JOSE FABIO DE SOUZA COELHO
BENEVALDO	1113631	3º SGT	BENEVALDO BRANDÃO SILVA
ANDRES	1131966	CB	MEYGLES ANDRES RODRIGUES ALVES
SERAFIM	1137530	CB	JAMESSON SERAFIM GOMES
VIDAL BEZERRA	1140213	CB	GLEILSON VIDAL BEZERRA
JACKSON	1152602	CB	JACKSON DE SOUZA ROCHA
HONORATO	1152840	CB	MARINALDO LACERDA HONORATO FILHO
MAGNO ALENCAR	1155083	CB	CHARLES MAGNO ALVES DE ALENCAR
BARROS	1156098	CB	ROGÉRIO LOPES DE BARROS
FELINTO	1157388	CB	SAULO FELINTO CAVALCANTE
CORDEIRO SANTOS	1163450	CB	ANTONIO MARCOS CORDEIRO DOS SANTOS
LACERDA	1172441	CB	NILSON ROBERTO LACERDA PEREIRA
RONIVON	117696-0	CB	RONIVON PAULINO ALVES
ARISON	1175190	CB	DEYVID ARISON DOS SANTOS SILVA
S. CORDEIRO	1138146	CB	ALEXANDRE DA SILVA CORDEIRO
LOURENÇO	1177451	CB	ALAN LOURENÇO SOARES DE SOUZA
TIAGO NERI	1177630	CB	WILLAMY TIAGO NERI BORGES
CHARLES SILVA	1182528	CB	WILLYAMIS CHARLES ALVES DA SILVA
WALDEBERTO	1196588	CB	WALDEBERTO MOURA FONTES FEITOSA
RICARTE	1201328	CB	CARLA LEITE RICARTE
J. RIBEIRO	1201352	CB	JONATHANS RIBEIRO DE OLIVEIRA
SEBASTIÃO	1201425	CB	SEBASTIAO DE SOUZA SANTOS
MAIA	1202928	CB	JOAO DAVI MAIA DE LUNA
MACEDO	1203010	CB	MICHEL GOMES MACEDO
DUTRA	1203118	CB	LUCAS RAFAEL DUTRA DE OLIVEIRA ANJOS
FONSECA	1203533	CB	GABRIEL FONSECA TORRES
EDUARDO NASCIMENTO	1204254	CB	ITALO EDUARDO DO NASCIMENTO ALENCAR
GEORGE PEREIRA	1204564	CB	JOSÉ GEORGE PEREIRA DE OLIVEIRA
FRANCIELVES	1204971	CB	FRANCIELVES DO NASCIMENTO
ROBSON	1205919	SD	FRANCISCO ROBSON DOS SANTOS DA SILVA CRUZ
ALENCAR	1207342	SD	DIEGO BARROS DE ALENCAR
F. NUNES	1210220	SD	FIDEL LUCAS DE CARVALHO NUNES
LUCENA	1092820	SD	TERLON HENRIQUESTONE LUCENA SANTANA
FAUSTO	1215159	SD	FAUSTO AUGUSTINHO PEREIRA DA SILVA
FRANKLIN	1216147	SD	FRANKLIN DE CASTRO LEAL
DIAS	1216368	SD	ANDERSON VIEIRA DIAS ALENCAR
EVERTON ALENCAR	1216678	SD	EVERTON VASCONCELOS ALENCAR
ISMAEL PEREIRA	1216775	SD	ISMAEL PEREIRA DA SILVA
ALEX	1217089	SD	FRANCISCO ALEX DE OLIVEIRA RODRIGUES
CÉSAR FILHO	1217674	SD	JOAO CESAR DA SILVA FILHO
SOBREIRA	1218751	SD	ERISVALDO MANOEL SOBREIRA
ECLESYO	1219049	SD	ECLESYO BEZERRA ALMEIDA
ERICSON DUARTE	1219600	SD	ANTONIO ÉRICSON DUARTE BENTO
WEBSTER	1220063	SD	WEBSTER WENDY DOS SANTOS SILVA
ELWYN GOMES	1221027	SD	ELWYN DA SILVA GOMES
JARDENIA	1221035	SD	JARDENIA DA SILVA LIMA
WYLKER	1221280	SD	WYLKER MOREIRA NOGUEIRA
LISBOA	1225600	SD	ISMAYLLON ROBSON DE NEGREIROS LISBOA
ANDRÉ LUIZ	1225383	SD	ANDRE LUIZ SILVA CARVALHO
J. MUNIZ	1226681	SD	JOCIVAN MUNIZ DE SOUSA
MARTINS	1237578	SD	JAKSON JOSÉ MARTINS RODRIGUES
MADEIRA	1239040	SD	CLEITON CARLOS MADEIRA
COELHO	1240030	SD	WILDEMBERG REGIS COELHO
GIVALDO JÚNIOR	1240250	SD	GIVALDO ALVES DOS SANTOS JUNIOR
PIMENTEL	1240374	SD	FILLIPE PIMENTEL DA PAIXAO
NETO	1242008	SD	PEDRO PILE DA SILVA NETO
S. NOGUEIRA	1241362	SD	SANDERSON SANTOS NOGUEIRA
ALVES	1242822	SD	FELIPE AMORIM ALVES
STENIO	1251970	SD	STENIO SAMPAIO DA SILVA
GUTEMBERG	1252038	SD	GUTEMBERG FERREIRA DA SILVA
GUSTAVO FERREIRA	1252135	SD	LUIZ GUSTAVO DOS SANTOS FERREIRA
MARLLON	1252143	SD	MARLLON ALEKSANDER FONSECA ESPÍRITO SANTO
LINS	1252178	SD	DAVI OLIVEIRA LINS DA SILVA
ELTON	1252194	SD	ELTON BARBOSA SANTOS
THUANY	1252364	SD	JAMILLE THUANY ALENCAR LEITE
SILVA	1252712	SD	WQUEVEN LUNA DA SILVA
PEDRO	1252771	SD	PEDRO HENRIQUE DA SILVA PINHEIRO
RICARDO NASCIMENTO	1254073	SD	RAFAEL RICARDO DE SOUSA NASCIMENTO
FRANCINETE	1254251	SD	ELANE FRANCINETE DE JESUS NOGUEIRA
DA SILVA	1255851	SD	EDIGLEDSON PEREIRA DA SILVA
R. PEREIRA	1255967	SD	RUAN PEREIRA BARBOSA
NATANAEL	1256688	SD	WESLEY NATANAEL DOS SANTOS SOUZA
MONTE SANTO	1256947	SD	MICAEL MARTINS MONTE SANTO
RUTH ALENCAR	1289985	SD	RUTH ELLEN CRUZ ALENCAR
DIOGENES	1259180	SD	THARLLES DIOGENES SANTANA LUCENA
MARIA	1260901	SD	MARIA IARA DE MORAIS ROSENDO
LEAL	1261282	SD	EVALDO LEAL FILHO
ELIEUZA LEAL	1263846	SD	ELIEUZA LEAL LIMA
RIOMAR	320536	2º SGT	RIOMAR
CARLOS	1090534	3º SGT	CARLOS ANTONIO NOVAES PEREIRA
ALEXANDRO	1047752	2ª SGT	ALEXANDRO
TERTO	1218360	SD	TERTO
WESLEY LEITE	1206770	SD	JOSÉ WESLEY ARAUJO LEITE`;

export const OfficerView: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    if (cleanRank.includes('TEN.CEL')) return Rank.TC;
    if (cleanRank.includes('CAP')) return Rank.CAP;
    if (cleanRank.includes('2º TEN') || cleanRank.includes('2ºTEN')) return Rank.TEN2;
    if (cleanRank.includes('1º TEN')) return Rank.TEN1;
    if (cleanRank.includes('ST')) return Rank.SUB;
    if (cleanRank.includes('1º SGT')) return Rank.SGT1;
    if (cleanRank.includes('2º SGT') || cleanRank.includes('2ª SGT') || cleanRank.includes("2'º SGT")) return Rank.SGT2;
    if (cleanRank.includes('3º SGT') || cleanRank.includes('3ºSGT')) return Rank.SGT3;
    if (cleanRank.includes('CB')) return Rank.CB;
    if (cleanRank.includes('SD')) return Rank.SD;
    return Rank.SD;
  };

  const handleImportOfficialList = async () => {
    if (!confirm(`Deseja importar a lista oficial de efetivo? Isso processará aproximadamente ${OFFICIAL_LIST_RAW.trim().split('\n').length} registros.`)) return;
    
    setIsImporting(true);
    const lines = OFFICIAL_LIST_RAW.trim().split('\n');
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      const parts = line.split('\t').map(s => s?.trim());
      // Estrutura: NOME_GUERRA \t MATRICULA \t POSTO/GRAD \t NOME_COMPLETO
      const warNamePart = parts[0];
      const regPart = parts[1];
      const rankPart = parts[2];
      const fullNamePart = parts[3];

      if (!regPart || !fullNamePart) {
        continue;
      }

      try {
        const officer: any = {
          id: '', // UUID gerado pelo Supabase
          fullName: fullNamePart,
          registration: regPart.replace(/\s+/g, ''),
          rank: mapRank(rankPart),
          warName: warNamePart || fullNamePart.split(' ')[0],
          isAvailable: true,
          unavailabilityReason: UnavailabilityReason.NONE,
          customReason: ''
        };
        await upsertOfficer(officer);
        successCount++;
      } catch (e) {
        console.error('Erro ao importar policial:', fullNamePart, e);
        errorCount++;
      }
    }

    setIsImporting(false);
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
          <div className="flex gap-2">
            <button
              onClick={handleImportOfficialList}
              disabled={isImporting}
              className="flex items-center justify-center bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
              Importar Lista Oficial
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
