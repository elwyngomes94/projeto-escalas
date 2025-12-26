
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// SUBSTITUA PELAS SUAS CREDENCIAIS DO SUPABASE NO PAINEL DE CONFIGURAÇÕES
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon-public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  =============================================================================
  SCRIPT SQL PARA O SUPABASE (Execute no SQL Editor do seu painel Supabase)
  =============================================================================

  -- 1. Tabela de Militares (Efetivo)
  -- A restrição UNIQUE na matrícula é essencial para a função 'upsert' (importação)
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
    CONSTRAINT officers_registration_unique UNIQUE (registration)
  );

  -- 2. Tabela de Pelotões
  CREATE TABLE IF NOT EXISTS platoons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    commander_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- 3. Tabela de Guarnições e Escalas
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

  -- 4. Habilitar RLS (Segurança de Nível de Linha) - OPCIONAL para desenvolvimento
  -- Se as requisições falharem com erro de permissão, habilite o acesso público abaixo:
  
  -- ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Acesso Total" ON officers FOR ALL USING (true) WITH CHECK (true);
  
  -- ALTER TABLE platoons ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Acesso Total" ON platoons FOR ALL USING (true) WITH CHECK (true);
  
  -- ALTER TABLE garrisons ENABLE ROW LEVEL SECURITY;
  -- CREATE POLICY "Acesso Total" ON garrisons FOR ALL USING (true) WITH CHECK (true);
*/
