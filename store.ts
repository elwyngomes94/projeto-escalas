
import { Officer, Platoon, Garrison, TeamConfig, DutyType } from './types';
import { supabase, isConfigured } from './supabase';

interface StorageData {
  officers: Officer[];
  platoons: Platoon[];
  garrisons: Garrison[];
}

// Helper para validar UUID
const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

export const loadData = async (): Promise<StorageData> => {
  if (!isConfigured) return { officers: [], platoons: [], garrisons: [] };

  try {
    const [offRes, platRes, garRes] = await Promise.all([
      supabase.from('officers').select('*').order('rank'),
      supabase.from('platoons').select('*').order('name'),
      supabase.from('garrisons').select('*').order('created_at')
    ]);

    if (offRes.error) throw offRes.error;
    if (platRes.error) throw platRes.error;
    if (garRes.error) throw garRes.error;

    const officers: Officer[] = (offRes.data || []).map((o: any) => ({
      id: o.id,
      fullName: o.full_name,
      registration: o.registration,
      rank: o.rank,
      warName: o.war_name,
      isAvailable: o.is_available,
      unavailabilityReason: o.unavailability_reason,
      customReason: o.custom_reason
    }));

    const platoons: Platoon[] = (platRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      commanderId: p.commander_id
    }));

    const garrisons: Garrison[] = (garRes.data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      platoonId: g.platoon_id,
      teams: g.teams as TeamConfig,
      dutyType: g.duty_type as DutyType,
      specificDates: g.specific_dates,
      startTime: g.start_time,
      endTime: g.end_time
    }));

    return { officers, platoons, garrisons };
  } catch (error) {
    console.error("Erro crítico ao carregar dados:", error);
    return { officers: [], platoons: [], garrisons: [] };
  }
};

export const upsertOfficer = async (officer: Officer) => {
  if (!isConfigured) throw new Error("Supabase não configurado");
  
  const payload: any = {
    full_name: officer.fullName,
    registration: officer.registration,
    rank: officer.rank,
    war_name: officer.warName,
    is_available: officer.isAvailable,
    unavailability_reason: officer.unavailabilityReason || null,
    custom_reason: officer.customReason || null
  };

  if (officer.id && isValidUUID(officer.id)) {
    payload.id = officer.id;
  }

  const { data, error } = await supabase
    .from('officers')
    .upsert(payload, { 
      onConflict: 'registration',
      ignoreDuplicates: false 
    })
    .select();

  if (error) throw error;
  return data;
};

export const deleteOfficer = async (id: string) => {
  if (!isConfigured || !isValidUUID(id)) return;
  const { error } = await supabase.from('officers').delete().eq('id', id);
  if (error) throw error;
};

export const upsertPlatoon = async (platoon: Platoon) => {
  if (!isConfigured) throw new Error("Supabase não configurado");
  const payload: any = {
    name: platoon.name,
    city: platoon.city,
    commander_id: platoon.commanderId && isValidUUID(platoon.commanderId) ? platoon.commanderId : null
  };
  
  if (platoon.id && isValidUUID(platoon.id)) {
    payload.id = platoon.id;
  }
  
  const { error } = await supabase.from('platoons').upsert(payload);
  if (error) throw error;
};

export const deletePlatoon = async (id: string) => {
  if (!isConfigured || !isValidUUID(id)) return;
  const { error } = await supabase.from('platoons').delete().eq('id', id);
  if (error) throw error;
};

export const upsertGarrison = async (garrison: Garrison) => {
  if (!isConfigured) throw new Error("Supabase não configurado");
  const payload: any = {
    name: garrison.name,
    platoon_id: garrison.platoonId,
    teams: garrison.teams,
    duty_type: garrison.dutyType,
    specific_dates: garrison.specificDates,
    start_time: garrison.startTime,
    end_time: garrison.endTime
  };

  if (garrison.id && isValidUUID(garrison.id)) {
    payload.id = garrison.id;
  }
  
  const { error } = await supabase.from('garrisons').upsert(payload);
  if (error) throw error;
};

export const deleteGarrison = async (id: string) => {
  if (!isConfigured || !isValidUUID(id)) return;
  const { error } = await supabase.from('garrisons').delete().eq('id', id);
  if (error) throw error;
};
