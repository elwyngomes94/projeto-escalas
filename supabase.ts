
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  =============================================================================
  SCRIPT SQL PARA O SUPABASE (Execute no SQL Editor do seu painel)
  =============================================================================

  -- 1. Limpar tabelas antigas (opcional, use apenas se quiser resetar)
  -- DROP TABLE IF EXISTS garrisons;
  -- DROP TABLE IF EXISTS platoons;
  -- DROP TABLE IF EXISTS officers;

  -- 2. Tabela de Militares (Efetivo)
  CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    registration TEXT NOT NULL,
    rank TEXT NOT NULL,
    war_name TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    unavailability_reason TEXT,
    custom_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT officers_registration_unique UNIQUE (registration) -- CRITICAL PARA IMPORTAÇÃO
  );

  -- 3. Tabela de Pelotões
  CREATE TABLE IF NOT EXISTS platoons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    commander_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 4. Tabela de Guarnições e Escalas
  CREATE TABLE IF NOT EXISTS garrisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platoon_id UUID REFERENCES platoons(id) ON DELETE CASCADE,
    teams JSONB NOT NULL,
    duty_type TEXT NOT NULL,
    specific_dates JSONB,
    start_time TEXT,
    end_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 5. Habilitar acesso público para testes (Opcional - RLS)
  -- ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Acesso Público" ON officers FOR ALL USING (true);
  -- (Repetir para platoons e garrisons se necessário)
*/
