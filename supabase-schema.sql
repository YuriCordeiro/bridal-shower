-- SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do seu painel Supabase

-- 1. Tabela para RSVPs (Confirmações de Presença)
CREATE TABLE public.rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    cpf VARCHAR(14) NOT NULL,
    attendance VARCHAR(10) NOT NULL CHECK (attendance IN ('sim', 'nao')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para Lista de Presentes
CREATE TABLE public.gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    purchased BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    category VARCHAR(100),
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para Informações do Evento
CREATE TABLE public.event_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_location TEXT NOT NULL,
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela para Mensagens aos Noivos
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela para Usuários Administrativos
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 5. Tabela usuários administradores
CREATE TABLE public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de RLS (Row Level Security)
-- Permitir leitura e escrita para todos (ajustar conforme necessário)

-- RSVPs
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on rsvps" ON public.rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on rsvps" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Allow public update on rsvps" ON public.rsvps FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on rsvps" ON public.rsvps FOR DELETE USING (true);

-- Gifts
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on gifts" ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Allow public update on gifts" ON public.gifts FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on gifts" ON public.gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on gifts" ON public.gifts FOR DELETE USING (true);

-- Event Info
ALTER TABLE public.event_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on event_info" ON public.event_info FOR SELECT USING (true);
CREATE POLICY "Allow public update on event_info" ON public.event_info FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on event_info" ON public.event_info FOR INSERT WITH CHECK (true);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on messages" ON public.messages FOR SELECT USING (true);

-- Admin Users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on admin_users" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Allow public update on admin_users" ON public.admin_users FOR UPDATE USING (true);

-- Inserir informações básicas do evento (exemplo)
INSERT INTO public.event_info (event_date, event_time, event_location, additional_info)
VALUES 
  ('2025-11-20', '15:00:00', 'Rua Gonzaga, 225 - Parque Rincão | Cotia', 'Salão de Festas');

-- Inserir alguns presentes de exemplo
-- INSERT INTO public.gifts (name, description, price, category, order_index)
-- VALUES 
--   ('Jogo de Panelas Antiaderente', 'Conjunto com 5 panelas antiaderentes de alta qualidade', 299.90, 'Cozinha', 1),
--   ('Liquidificador Premium', 'Liquidificador com 12 velocidades e função pulsar', 189.90, 'Eletrodomésticos', 2),
--   ('Jogo de Toalhas de Banho', 'Conjunto com 4 toalhas 100% algodão', 89.90, 'Banheiro', 3),
--   ('Cafeteira Elétrica', 'Cafeteira programável para 12 xícaras', 149.90, 'Eletrodomésticos', 4),
--   ('Jogo de Cama Casal', 'Jogo de cama 200 fios, 4 peças', 129.90, 'Quarto', 5);