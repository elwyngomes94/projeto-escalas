
export enum Rank {
  SD = 'Soldado',
  CB = 'Cabo',
  SGT3 = '3º Sargento',
  SGT2 = '2º Sargento',
  SGT1 = '1º Sargento',
  SUB = 'Subtenente',
  ASP = 'Aspirante',
  TEN2 = '2º Tenente',
  TEN1 = '1º Tenente',
  CAP = 'Capitão',
  MAJ = 'Major',
  TC = 'Tenente Coronel',
  COL = 'Coronel'
}

export enum UnavailabilityReason {
  NONE = 'Nenhum',
  LTS = 'LTS (Licença Tratamento Saúde)',
  RTS = 'RTS (Repouso Tratamento Saúde)',
  VACATION = 'Férias',
  OTHER = 'Outros'
}

export interface Officer {
  id: string;
  fullName: string;
  registration: string;
  rank: Rank;
  warName: string;
  isAvailable: boolean;
  unavailabilityReason?: UnavailabilityReason;
  customReason?: string;
}

export interface Platoon {
  id: string;
  name: string;
  city: string;
  commanderId: string;
}

export enum DutyType {
  STANDARD_1X3 = '24X72h',
  STANDARD_48X144 = '48X144h',
  COMPLEMENTARY = 'Complementar'
}

export interface TeamData {
  officerIds: string[];
  startDate: string;
}

export interface TeamConfig {
  A: TeamData;
  B: TeamData;
  C: TeamData;
  D: TeamData;
}

export interface Garrison {
  id: string;
  name: string;
  platoonId: string;
  teams: TeamConfig;
  dutyType: DutyType;
  specificDates?: string[];
  startTime?: string;
  endTime?: string;
}
