import { supabase } from '../src/lib/supabase';

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase.from('rsvps').select('*');
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error);
      return;
    }
    
    console.log('✅ Conexão com Supabase bem-sucedida!');
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros');
    console.log('📋 RSVPs:', data);
    
    // Testar tabela de guests
    const { data: guests, error: guestsError } = await supabase.from('guests').select('*');
    
    if (guestsError) {
      console.error('❌ Erro ao buscar guests:', guestsError);
    } else {
      console.log('👥 Guests encontrados:', guests?.length || 0, 'registros');
      console.log('📋 Guests:', guests);
    }
    
  } catch (err) {
    console.error('💥 Erro inesperado:', err);
  }
}

testSupabaseConnection();