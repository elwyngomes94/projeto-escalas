
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle, FileUp, X, Check, Loader2, Database, ClipboardPaste, ListFilter, Sparkles } from 'lucide-react';
import { loadData, upsertOfficer, deleteOfficer } from '../store';
import { Officer, Rank, UnavailabilityReason } from '../types';

// LISTA OFICIAL FORNECIDA PELO USUÁRIO (TEXTO BRUTO PARA PROCESSAMENTO)
const OFFICIAL_BASE_LIST = `CRISTOVÃO 1021230 TEN.CEL CRISTOVÃO ISAAC RODRIGUES MAGALHÃES
EDVAN 9807721 CAP EDVAN ARRUDA FERRAZ
MYKE 119793 2 2º DEZ JOSEPH MYKE DA SILVA
TAVARES 1260782 2º TEN PAULO HENRIQUE DA SILVA TAVARES
HUMBERTO 1260790 2º DEZ HUMBERTO VICTOR ALBUQUERQUE DE VASCONCELOS
RONALDO 9504001 1º SGT RONALDO DO NASCIMENTO LOPES
E. PEREIRA 1030434 ST EDINALDO PEREIRA DA SILVA
BERREDO 1055275 ST DOALCEY BERREDO VILANOVA DOS SANTOS
EDMAR 1056190 1º SGT EDMAR PEREIRA DA SILVA FILHO
OSMILAN 1031554 ST OSMILAN SOARES DA SILVA
JAIRO 9210580 2º SGT JAIRO GOMES LOPES
NASCIMENTO 9900977 2º SGT FRANCISCO de ASSIS DO NASCIMENTO
ANDRADE 9210431 2º SGT FRANCISCO JOSÉ ALENCAR ANDRADE
TEÓFILO 9210520 2º SGT TEÓFILO CESARIO DA SILVA
EUDES 9400303 2º SGT EUDES VITO ARAUJO
WILDES 9403191 2º SGT CARLOS WILDES DA SILVA FILHO
CALDEIRA 9403116 2º SGT EDSON CALDEIRA DA SILVA
TOMAZ 1063863 2º SGT SAMUEL TOMAZ SANTOS DE JESUS
NERI 9807080 2º SGT SILVANIO NERI DA SILVA
ERIVAN 1053817 2º SGT JOSE ERIVAN LIMA SILVINO
ERONILDO 1064720 2º SGT JACKSON ERONILDO NUNES DE SOUZA
PRISCILA 1074636 3º SGT PRISCILA RAQUEL TORRES CIPRIANO DA SILVA
KLEBER 1070517 2º SGT KLEBER DE SOUSA BATISTA
DEYWD 1076434 3º SGT DEYWD ALEXANDRE TEIXEIRA SARAIVA
ERIVANO 1077007 3º SGT ERIVANO FRANCISCO DE OLIVEIRA
JEFFERSON 1079700 3º SGT JEFFERSON THIAGO CIPRIANO DA SILVA
DUARTE SOUZA 1065432 3º SGT WASHINTON ANTONIO DUARTE DE SOUZA
P. JACINTO 1092901 3º SGT FRANCISCO PEREIRA JACINTO
MOTA 1101471 3º SGT ANDERSON MOTA DOS SANTOS
SILVA SOUZA 1105000 3º SGT FABIO DA SILVA SOUZA
EWERTON 1077899 3º SGT EWERTON FERINO CARNEIRO
CICERO ROCHA 1098500 3º SGT CICERO HELYSON ROCHA DOS SANTOS
GICLAUDIO 1101307 3º SGT GICLAUDIO DA SILVA PEREIRA
RODRIGUES SOUZA 1103512 3º SGT WASHINGTON RODRIGUES DE SOUZA
C. HOLLAND 1111612 3º SGT CICERO CLEMENTINO DA HOLLAND
EDNO 1094262 3º SGT EDNO PEREIRA DE LIMA
CARLOS 1090534 3º SGT CARLOS ANTONIO NOVAES PEREIRA
MAYKE 1093770 3º SGT MAYKE DA SILVA PIRES
FÁBIO COELHO 1112104 CB JOSE FABIO DE SOUZA COELHO
BENEVALDO 1113631 3º SGT BENEVALDO BRANDÃO SILVA
ANDRES 1131966 CB MEYGLES ANDRES RODRIGUES ALVES
SERAFIM 1137530 CB JAMESSON SERAFIM GOMES
VIDAL BEZERRA 1140213 CB GLEILSON VIDAL BEZERRA
JACKSON 1152602 CB JACKSON DE SOUZA ROCHA
HONORATO 1152840 CB MARINALDO LACERDA HONORATO FILHO
MAGNO ALENCAR 1155083 CB CHARLES MAGNO ALVES DE ALENCAR
BARROS 1156098 CB ROGÉRIO LOPES DE BARROS
FELINTO 1157388 CB SAULO FELINTO CAVALCANTE
CORDEIRO SANTOS 1163450 CB ANTONIO MARCOS CORDEIRO DOS SANTOS
LACERDA 1172441 CB NILSON ROBERTO LACERDA PEREIRA
RONIVON 1176960 CB RONIVON PAULINO ALVES
ARISON 1175190 CB DEYVID ARISON DOS SANTOS SILVA
S. CORDEIRO 1138146 CB ALEXANDRE DA SILVA CORDEIRO
LOURENÇO 1177451 CB ALAN LOURENÇO SOARES DE SOUZA
TIAGO NERI 1177630 CB WILLAMY TIAGO NERI BORGES
CHARLES SILVA 1182528 CB WILLYAMIS CHARLES ALVES DA SILVA
WALDEBERTO 1196588 CB WALDEBERTO MOURA FONTES FEITOSA
RICARTE 1201328 CB CARLA LEITE RICARTE
J. RIBEIRO 1201352 CB JONATHANS RIBEIRO DE OLIVEIRA
SEBASTIÃO 1201425 CB SEBASTIAO DE SOUZA SANTOS
MAIA 1202928 CB JOAO DAVI MAIA DE LUNA
MACEDO 1203010 CB MICHEL GOMES MACEDO
DUTRA 1203118 CB LUCAS RAFAEL DUTRA DE OLIVEIRA ANJOS
FONSECA 1203533 CB GABRIEL FONSECA TORRES
EDUARDO NASCIMENTO 1204254 CB ITALO EDUARDO DO NASCIMENTO ALENCAR
GEORGE PEREIRA 1204564 CB JOSÉ GEORGE PEREIRA DE OLIVEIRA
FRANCIELVES 1204971 CB FRANCIELVES DO NASCIMENTO
ROBSON 1205919 SD FRANCISCO ROBSON DOS SANTOS DA SILVA CRUZ
ALENCAR 1207342 SD DIEGO BARROS DE ALENCAR
F. NUNES 1210220 SD FIDEL LUCAS DE CARVALHO NUNES
LUCENA 1092820 SD TERLON HENRIQUESTONE LUCENA SANTANA
FAUSTO 1215159 SD FAUSTO AUGUSTINHO PEREIRA DA SILVA
FRANKLIN 1216147 SD FRANKLIN DE CASTRO LEAL
DIAS 1216368 SD ANDERSON VIEIRA DIAS ALENCAR
EVERTON ALENCAR 1216678 SD EVERTON VASCONCELOS ALENCAR
ISMAEL PEREIRA 1216775 SD ISMAEL PEREIRA DA SILVA
ALEX 1217089 SD FRANCISCO ALEX DE OLIVEIRA RODRIGUES
CÉSAR FILHO 1217674 SD JOAO CESAR DA SILVA FILHO
SOBREIRA 1218751 SD ERISVALDO MANOEL SOBREIRA
ECLESYO 1219049 SD ECLESYO BEZERRA ALMEIDA
ERICSON DUARTE 1219600 SD ANTONIO ÉRICSON DUARTE BENTO
WEBSTER 1220063 SD WEBSTER WENDY DOS SANTOS SILVA
ELWYN GOMES 1221027 SD ELWYN DA SILVA GOMES
JARDÊNIA 1221035 SD JARDÊNIA DA SILVA LIMA
WYLKER 1221280 SD WYLKER MOREIRA NOGUEIRA
LISBOA 1225600 SD ISMAYLLON ROBSON DE NEGREIROS LISBOA
ANDRÉ LUIZ 1225383 SD ANDRE LUIZ SILVA CARVALHO
J. MUNIZ 1226681 SD JOCIVAN MUNIZ DE SOUSA
MARTINS 1237578 SD JACKSON JOSÉ MARTINS RODRIGUES
MADEIRA 1239040 SD CLEITON CARLOS MADEIRA
COELHO 1240030 SD WILDEMBERG REGIS COELHO
GIVALDO JÚNIOR 1240250 SD GIVALDO ALVES DOS SANTOS JUNIOR
PIMENTEL 1240374 SD FILLIPE PIMENTEL DA PAIXAO
NETO 1242008 SD PEDRO PILE DA SILVA NETO
S. NOGUEIRA 1241362 SD SANDERSON SANTOS NOGUEIRA
ALVES 1242822 SD FELIPE AMORIM ALVES
STENIO 1251970 SD STENIO SAMPAIO DA SILVA
GUTEMBERG 1252038 SD GUTEMBERG FERREIRA DA SILVA
GUSTAVO FERREIRA 1252135 SD LUIZ GUSTAVO DOS SANTOS FERREIRA
MARLLON 1252143 SD MARLLON ALEKSANDER FONSECA ESPÍRITO SANTO
LINS 1252178 SD DAVI OLIVEIRA LINS DA SILVA
ELTON 1252194 SD ELTON BARBOSA SANTOS
THUANY 1252364 SD JAMILLE THUANY ALENCAR LEITE
SILVA 1252712 SD WQUEVEN LUNA DA SILVA
PEDRO 1252771 SD PEDRO HENRIQUE DA SILVA PINHEIRO
RICARDO NASCIMENTO 1254073 SD RAFAEL RICARDO DE SOUSA NASCIMENTO
FRANCINETE 1254251 SD ELANE FRANCINETE DE JESUS NOGUEIRA
DA SILVA 1255851 SD EDIGLEDSON PEREIRA DA SILVA
R. PEREIRA 1255967 SD RUAN PEREIRA BARBOSA
NATANAEL 1256688 SD WESLEY NATANAEL DOS SANTOS SOUZA
MONTE SANTO 1256947 SD MICAEL MARTINS MONTE SANTO
RUTH ALENCAR 1289985 SD RUTH ELLEN CRUZ ALENCAR
DIÓGENES 1259180 SD THARLLES DIÓGENES SANTANA LUCENA
MARIA 1260901 SD MARIA IARA DE MORAIS ROSENDO
LEAL 1261282 SD EVALDO LEAL FILHO
ELIEUZA LEAL 1263846 SD ELIEUZA LEAL LIMA
RIOMAR 320536 2º SGT RIOMAR
CARLOS 1090534 3º SGT CARLOS ANTONIO NOVAES PEREIRA
ALEXANDRO 1047752 2º SGT ALEXANDRO
TERTO 1218360 SD TERTO
WESLEY LEITE 1206770 SD JOSÉ WESLEY ARAUJO LEITE`;

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
    const normalized = data.officers.map((o: any) => ({
      ...o,
      fullName: o.fullName || o.full_name,
      warName: o.warName || o.war_name,
      isAvailable: o.isAvailable ?? o.is_available,
      registration: o.registration,
      rank: o.rank,
      unavailabilityReason: o.unavailabilityReason || o.unavailability_reason
    }));
    setOfficers(normalized);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const mapRank = (rankStr: string): Rank => {
    const s = rankStr?.trim().toUpperCase() || '';
    if (s.includes('TEN.CEL') || s.includes('TC')) return Rank.TC;
    if (s.includes('MAJ')) return Rank.MAJ;
    if (s.includes('CAP')) return Rank.CAP;
    // Lidar com correções comuns do usuário (DEZ = TEN)
    if (s.includes('TEN') || s.includes('DEZ')) {
      if (s.includes('1º')) return Rank.TEN1;
      if (s.includes('2º')) return Rank.TEN2;
      return Rank.TEN2;
    }
    if (s.includes('ST') || s.includes('SUB')) return Rank.SUB;
    if (s.includes('SGT') || s.includes('SARGENTO')) {
      if (s.includes('1º')) return Rank.SGT1;
      if (s.includes('2º')) return Rank.SGT2;
      if (s.includes('3º')) return Rank.SGT3;
      return Rank.SGT3;
    }
    if (s.includes('CB') || s.includes('CABO')) return Rank.CB;
    if (s.includes('SD') || s.includes('SOLDADO')) return Rank.SD;
    return Rank.SD;
  };

  const parseTextToList = (text: string) => {
    const lines = text.trim().split('\n');
    const preview: any[] = [];

    lines.forEach(line => {
      // 1. Tentar separar por Tab (Excel)
      let parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      
      // 2. Se falhar, tentar separar por múltiplos espaços ou espaços irregulares
      if (parts.length < 3) {
        // Tenta identificar padrões na linha. O formato esperado é: NOME_GUERRA MATRICULA POSTO NOME_COMPLETO
        const rawTokens = line.split(/\s+/).map(t => t.trim()).filter(Boolean);
        if (rawTokens.length >= 4) {
          // Heurística de extração para o formato do usuário:
          // [0] Nome Guerra, [1] Matrícula, [2] Posto (ou Posto completo), [Resto] Nome Completo
          const war = rawTokens[0];
          const reg = rawTokens[1].replace(/[^\d]/g, ''); // Garante matrícula numérica
          
          // O Posto pode ter 1 ou 2 tokens (ex: "TEN.CEL" ou "2º SGT")
          let rankToken = '';
          let nameStartIdx = 3;
          
          if (rawTokens[2].includes('º') || rawTokens[2].includes('1') || rawTokens[2].includes('2') || rawTokens[2].includes('3')) {
            // Provavelmente "2º SGT" ou "3º TEN"
            rankToken = rawTokens[2] + ' ' + rawTokens[3];
            nameStartIdx = 4;
          } else {
            // Provavelmente "CAP" ou "CB"
            rankToken = rawTokens[2];
            nameStartIdx = 3;
          }

          const fullNamePart = rawTokens.slice(nameStartIdx).join(' ');
          
          parts = [war, reg, rankToken, fullNamePart];
        }
      }

      if (parts.length < 3) return;
      if (parts[0].toUpperCase().includes('NOME DE GUERRA')) return;

      const warNamePart = parts[0];
      const regPart = parts[1]?.replace(/[^\d]/g, '');
      const rankPart = parts[2];
      const fullNamePart = parts[3] || parts[0];

      if (regPart && regPart.length >= 4) {
        preview.push({
          warName: warNamePart,
          registration: regPart,
          rank: mapRank(rankPart),
          fullName: fullNamePart,
          status: officers.some(o => o.registration === regPart) ? 'update' : 'new'
        });
      }
    });
    return preview;
  };

  useEffect(() => {
    if (importText) {
      setImportPreview(parseTextToList(importText));
    } else {
      setImportPreview([]);
    }
  }, [importText, officers]);

  const handleProcessImport = async () => {
    if (importPreview.length === 0) return;
    setIsImporting(true);
    let count = 0;
    for (const item of importPreview) {
      try {
        await upsertOfficer({
          id: '',
          fullName: item.fullName,
          registration: item.registration,
          rank: item.rank,
          warName: item.warName,
          isAvailable: true,
          unavailabilityReason: UnavailabilityReason.NONE
        });
        count++;
      } catch (e) { console.error(e); }
    }
    setIsImporting(false);
    setIsImportModalOpen(false);
    setImportText('');
    alert(`${count} policiais processados e salvos com sucesso no banco de dados!`);
    refreshData();
  };

  const loadOfficialList = () => {
    setImportText(OFFICIAL_BASE_LIST);
  };

  const handleSave = async () => {
    if (!fullName || !registration || !warName) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await upsertOfficer({
        id: editingId || '',
        fullName,
        registration: registration.replace(/[^\d]/g, ''),
        rank,
        warName,
        isAvailable,
        unavailabilityReason: isAvailable ? UnavailabilityReason.NONE : unavailabilityReason,
        customReason: isAvailable ? '' : customReason
      });
      await refreshData();
      closeModal();
    } catch (e: any) { alert(e.message); }
  };

  const openModal = (o?: Officer) => {
    if (o) {
      setEditingId(o.id);
      setFullName(o.fullName);
      setRegistration(o.registration);
      setRank(o.rank);
      setWarName(o.warName);
      setIsAvailable(o.isAvailable);
      setUnavailabilityReason(o.unavailabilityReason || UnavailabilityReason.NONE);
      setCustomReason(o.customReason || '');
    } else {
      setEditingId(null);
      setFullName('');
      setRegistration('');
      setRank(Rank.SD);
      setWarName('');
      setIsAvailable(true);
      setUnavailabilityReason(UnavailabilityReason.NONE);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filtered = officers.filter(o => 
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.warName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.registration.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou matrícula..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm"
          >
            <Database className="w-4 h-4 mr-2" /> Importar Lista
          </button>
          <button
            onClick={() => openModal()}
            className="flex-1 md:flex-none flex items-center justify-center bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors shadow-sm font-bold text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Cadastrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Carregando efetivo...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                {filtered.map((o) => (
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
                      <button onClick={async () => { if(confirm('Excluir policial?')) { await deleteOfficer(o.id); refreshData(); } }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Importação */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center">
                <Database className="w-6 h-6 mr-3 text-amber-500" />
                <h2 className="text-xl font-bold">Importação de Efetivo</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-6 flex flex-col space-y-4 border-r border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Cole os dados aqui</label>
                  <button onClick={loadOfficialList} className="text-[10px] bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-black flex items-center hover:bg-amber-200 transition-colors">
                    <Sparkles className="w-3 h-3 mr-1" /> Carregar Lista de 121 Policiais
                  </button>
                </div>
                <textarea
                  className="w-full flex-1 p-4 bg-slate-50 border border-gray-200 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Formato esperado: NOME_GUERRA MATRICULA POSTO NOME_COMPLETO"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>
              <div className="lg:w-1/2 p-6 flex flex-col bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center">
                  <ListFilter className="w-4 h-4 mr-2" /> Conferência Automática ({importPreview.length})
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {importPreview.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center text-[11px]">
                      <div>
                        <p className="font-black text-slate-900 leading-none uppercase">{item.rank} {item.warName}</p>
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[180px]">{item.fullName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-400">{item.registration}</p>
                        <span className={`text-[8px] font-black uppercase ${item.status === 'new' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'} px-1 rounded`}>
                          {item.status === 'new' ? 'Novo' : 'Atualizar'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {importPreview.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                      <AlertCircle className="w-12 h-12 opacity-20" />
                      <p className="italic text-xs text-center px-10">Os dados processados aparecerão aqui para sua revisão antes de serem salvos no banco de dados.</p>
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
                className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                   <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> SALVANDO...</span>
                ) : (
                   <span className="flex items-center"><Check className="w-5 h-5 mr-2" /> FINALIZAR IMPORTAÇÃO</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro Individual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Policial' : 'Novo Policial'}</h2>
              <button onClick={closeModal} className="p-2 text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nome Completo *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Matrícula *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={registration} onChange={(e) => setRegistration(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Posto / Graduação *</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={rank} onChange={(e) => setRank(e.target.value as Rank)}>
                    {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nome de Guerra *</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={warName} onChange={(e) => setWarName(e.target.value)} />
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
                    <select className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500" value={unavailabilityReason} onChange={(e) => setUnavailabilityReason(e.target.value as UnavailabilityReason)}>
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
