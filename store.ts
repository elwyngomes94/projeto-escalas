
import { Officer, Platoon, Garrison } from './types';
import { supabase } from './supabase';

interface StorageData {
  officers: Officer[];
  platoons: Platoon[];
  garrisons: Garrison[];
}

export const loadData = async (): Promise<StorageData> => {
  const { data: officers } = await supabase.from('officers').select('*').order('rank');
  const { data: platoons } = await supabase.from('platoons').select('*').order('name');
  const { data: garrisons } = await supabase.from('garrisons').select('*').order('created_at');

  return {
    officers: officers || [],
    platoons: platoons || [],
    garrisons: garrisons || []
  };
};

// Funções granulares para melhor performance
export const upsertOfficer = async (officer: Officer) => {
  const { data, error } = await supabase.from('officers').upsert({
    id: officer.id.length > 20 ? officer.id : undefined, // Garante UUID ou deixa gerar
    full_name: officer.fullName,
    registration: officer.registration,
    rank: officer.rank,
    war_name: officer.warName,
    is_available: officer.isAvailable,
    unavailability_reason: officer.unavailabilityReason,
    custom_reason: officer.customReason
  });
  if (error) throw error;
  return data;
};

export const deleteOfficer = async (id: string) => {
  const { error } = await supabase.from('officers').delete().eq('id', id);
  if (error) throw error;
};

export const upsertPlatoon = async (platoon: Platoon) => {
  const { error } = await supabase.from('platoons').upsert({
    id: platoon.id.length > 20 ? platoon.id : undefined,
    name: platoon.name,
    city: platoon.city,
    commander_id: platoon.commanderId || null
  });
  if (error) throw error;
};

export const deletePlatoon = async (id: string) => {
  const { error } = await supabase.from('platoons').delete().eq('id', id);
  if (error) throw error;
};

export const upsertGarrison = async (garrison: Garrison) => {
  const { error } = await supabase.from('garrisons').upsert({
    id: garrison.id.length > 20 ? garrison.id : undefined,
    name: garrison.name,
    platoon_id: garrison.platoonId,
    teams: garrison.teams,
    duty_type: garrison.dutyType,
    specific_dates: garrison.specificDates,
    start_time: garrison.startTime,
    end_time: garrison.endTime
  });
  if (error) throw error;
};

export const deleteGarrison = async (id: string) => {
  const { error } = await supabase.from('garrisons').delete().eq('id', id);
  if (error) throw error;
};
