
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  SCRIPT SQL ATUALIZADO (Execute no SQL Editor do Supabase):

  -- 1. Tabela de Oficiais/Praças com restrição UNIQUE na matrícula
  CREATE TABLE IF NOT EXISTS officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    registration TEXT UNIQUE NOT NULL, -- Matrícula deve ser ÚNICA para o upsert funcionar
    rank TEXT NOT NULL,
    war_name TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    unavailability_reason TEXT,
    custom_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 2. Tabela de Pelotões
  CREATE TABLE IF NOT EXISTS platoons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    commander_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 3. Tabela de Guarnições/Escalas
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

  -- 4. Habilitar RLS (Opcional, mas recomendado liberar para a chave anon se for ambiente de teste)
  -- ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Allow public access" ON officers FOR ALL USING (true);
  -- (Repetir para as outras se necessário)
*/
