
import { Officer, Platoon, Garrison, TeamConfig } from './types';
import { supabase } from './supabase';

interface StorageData {
  officers: Officer[];
  platoons: Platoon[];
  garrisons: Garrison[];
}

export const loadData = async (): Promise<StorageData> => {
  const { data: officersData } = await supabase.from('officers').select('*').order('rank');
  const { data: platoonsData } = await supabase.from('platoons').select('*').order('name');
  const { data: garrisonsData } = await supabase.from('garrisons').select('*').order('created_at');

  const officers: Officer[] = (officersData || []).map((o: any) => ({
    id: o.id,
    fullName: o.full_name,
    registration: o.registration,
    rank: o.rank,
    warName: o.war_name,
    isAvailable: o.is_available,
    unavailabilityReason: o.unavailability_reason,
    customReason: o.custom_reason
  }));

  const platoons: Platoon[] = (platoonsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    commanderId: p.commander_id
  }));

  const garrisons: Garrison[] = (garrisonsData || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    platoonId: g.platoon_id,
    teams: g.teams as TeamConfig,
    dutyType: g.duty_type,
    specificDates: g.specific_dates,
    startTime: g.start_time,
    endTime: g.end_time
  }));

  return { officers, platoons, garrisons };
};

export const upsertOfficer = async (officer: Officer) => {
  const payload: any = {
    full_name: officer.fullName,
    registration: officer.registration,
    rank: officer.rank,
    war_name: officer.warName,
    is_available: officer.isAvailable,
    unavailability_reason: officer.unavailabilityReason || null,
    custom_reason: officer.customReason || null
  };

  // Garante que o ID só é enviado se for um UUID válido e não uma string vazia
  if (officer.id && officer.id.length > 20) {
    payload.id = officer.id;
  }

  const { data, error } = await supabase
    .from('officers')
    .upsert(payload, { onConflict: 'registration' });

  if (error) throw error;
  return data;
};

export const deleteOfficer = async (id: string) => {
  const { error } = await supabase.from('officers').delete().eq('id', id);
  if (error) throw error;
};

export const upsertPlatoon = async (platoon: Platoon) => {
  const payload: any = {
    name: platoon.name,
    city: platoon.city,
    commander_id: platoon.commanderId || null
  };
  if (platoon.id && platoon.id.length > 20) payload.id = platoon.id;

  const { error } = await supabase.from('platoons').upsert(payload);
  if (error) throw error;
};

export const deletePlatoon = async (id: string) => {
  const { error } = await supabase.from('platoons').delete().eq('id', id);
  if (error) throw error;
};

export const upsertGarrison = async (garrison: Garrison) => {
  const payload: any = {
    name: garrison.name,
    platoon_id: garrison.platoonId,
    teams: garrison.teams,
    duty_type: garrison.dutyType,
    specific_dates: garrison.specificDates,
    start_time: garrison.startTime,
    end_time: garrison.endTime
  };
  if (garrison.id && garrison.id.length > 20) payload.id = garrison.id;

  const { error } = await supabase.from('garrisons').upsert(payload);
  if (error) throw error;
};

export const deleteGarrison = async (id: string) => {
  const { error } = await supabase.from('garrisons').delete().eq('id', id);
  if (error) throw error;
};
