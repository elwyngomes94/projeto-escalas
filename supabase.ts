
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  SCRIPT SQL PARA EXECUTAR NO SUPABASE SQL EDITOR:

  -- Tabela de Oficiais/Praças
  CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    registration TEXT UNIQUE NOT NULL,
    rank TEXT NOT NULL,
    war_name TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    unavailability_reason TEXT,
    custom_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabela de Pelotões
  CREATE TABLE platoons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    commander_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabela de Guarnições/Escalas
  CREATE TABLE garrisons (
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

  -- Habilitar RLS (Opcional para desenvolvimento, recomendado para produção)
  -- ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Allow public access" ON officers FOR ALL USING (true);
  -- (Repetir para as outras tabelas)
*/
