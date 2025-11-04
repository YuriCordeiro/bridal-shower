import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export interface SupabaseRSVP {
  id?: string;
  name: string;
  last_name: string;
  whatsapp: string;
  cpf: string;
  attendance: 'sim' | 'nao';
  message?: string;
  created_at?: string;
}

export interface SupabaseGuest {
  id?: string;
  rsvp_id: string;
  name: string;
  last_name: string;
  whatsapp: string;
  cpf: string;
  created_at?: string;
}

export interface SupabaseGift {
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  purchased: boolean;
  order_index: number;
  category?: string;
  link?: string;
  created_at?: string;
  reserved_by_name?: string;
  active?: boolean;
}

export interface SupabaseEventInfo {
  id?: string;
  event_date: string;
  event_time: string;
  event_location: string;
  additional_info?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseMessage {
  id?: string;
  sender_name: string;
  message: string;
  created_at?: string;
}

export interface SupabaseAdminUser {
  id?: string;
  username: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}