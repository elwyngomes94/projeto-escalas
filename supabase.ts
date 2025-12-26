
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DO SUPABASE
 * 
 * Substitua os valores abaixo pelos encontrados em seu painel:
 * Settings -> API -> Project URL / anon public key
 */
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; 
const SUPABASE_KEY = 'sua-chave-anon-public';

export const isConfigured = !SUPABASE_URL.includes('seu-projeto') && SUPABASE_KEY !== 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  =============================================================================
  SCRIPT SQL DEFINITIVO (Execute no 'SQL Editor' do Supabase)
  =============================================================================

  -- 1. Extensão para UUID
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- 2. Tabela de Militares (Efetivo) com UNIQUE na Matrícula
  CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    registration TEXT NOT NULL,
    rank TEXT NOT NULL,
    war_name TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    unavailability_reason TEXT,
    custom_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT officers_registration_unique UNIQUE (registration)
  );

  -- 3. Tabela de Pelotões
  CREATE TABLE IF NOT EXISTS platoons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    commander_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. Tabela de Guarnições (Escalas)
  CREATE TABLE IF NOT EXISTS garrisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    platoon_id UUID REFERENCES platoons(id) ON DELETE CASCADE,
    teams JSONB NOT NULL,
    duty_type TEXT NOT NULL,
    specific_dates JSONB,
    start_time TEXT DEFAULT '07:00',
    end_time TEXT DEFAULT '07:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 5. Habilitar RLS (Acesso Público para Desenvolvimento)
  ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Total" ON officers FOR ALL USING (true) WITH CHECK (true);

  ALTER TABLE platoons ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Total" ON platoons FOR ALL USING (true) WITH CHECK (true);

  ALTER TABLE garrisons ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Total" ON garrisons FOR ALL USING (true) WITH CHECK (true);

  -- 6. Índices para Performance
  CREATE INDEX IF NOT EXISTS idx_off_reg ON officers(registration);
  CREATE INDEX IF NOT EXISTS idx_gar_plat ON garrisons(platoon_id);
*/
