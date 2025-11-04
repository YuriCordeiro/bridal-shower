-- Migração para adicionar coluna 'active' na tabela gifts
-- Execute este comando no Supabase SQL Editor ou em seu banco de dados

-- Adicionar coluna 'active' com valor padrão TRUE
ALTER TABLE public.gifts 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Atualizar presentes existentes para serem ativos por padrão
UPDATE public.gifts 
SET active = TRUE 
WHERE active IS NULL;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.gifts.active IS 'Indica se o presente está ativo e visível na lista pública';