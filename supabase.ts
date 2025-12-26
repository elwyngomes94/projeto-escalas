
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

/**
 * CONFIGURAÇÃO DO SUPABASE
 * 
 * As credenciais abaixo tentam carregar de process.env caso existam no ambiente de build/runtime.
 * Caso contrário, substitua manualmente pelas chaves encontradas em:
 * Project Settings -> API -> Project URL / anon public key
 */
const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  =============================================================================
  SCRIPT SQL PARA EXECUÇÃO (Copie e cole no 'SQL Editor' do Supabase)
  =============================================================================

  -- 1. Habilitar extensão para UUIDs
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- 2. Tabela de Militares (Efetivo)
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

  -- 4. Tabela de Guarnições e Escalas
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

  -- 5. Configurar Segurança (RLS) para Acesso Público (Ambiente de Teste)
  ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Público Officers" ON officers FOR ALL USING (true) WITH CHECK (true);

  ALTER TABLE platoons ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Público Platoons" ON platoons FOR ALL USING (true) WITH CHECK (true);

  ALTER TABLE garrisons ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Acesso Público Garrisons" ON garrisons FOR ALL USING (true) WITH CHECK (true);

  -- 6. Otimização de busca
  CREATE INDEX IF NOT EXISTS idx_officers_registration ON officers(registration);
  CREATE INDEX IF NOT EXISTS idx_garrisons_platoon ON garrisons(platoon_id);
*/
