import { supabase } from '@/lib/supabase';
import { SupabaseGuest } from '@/lib/supabase';

export class GuestService {
  // Criar múltiplos acompanhantes
  static async createGuests(guests: Omit<SupabaseGuest, 'id' | 'created_at'>[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('guests')
        .insert(guests);

      if (error) {
        console.error('Erro ao criar acompanhantes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar acompanhantes:', error);
      return false;
    }
  }

  // Buscar acompanhantes de um RSVP
  static async getGuestsByRSVPId(rsvpId: string): Promise<SupabaseGuest[]> {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('rsvp_id', rsvpId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar acompanhantes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar acompanhantes:', error);
      return [];
    }
  }

  // Deletar acompanhantes de um RSVP
  static async deleteGuestsByRSVPId(rsvpId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('rsvp_id', rsvpId);

      if (error) {
        console.error('Erro ao deletar acompanhantes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar acompanhantes:', error);
      return false;
    }
  }

  // Atualizar acompanhantes (deletar existentes e criar novos)
  static async updateGuests(rsvpId: string, guests: Omit<SupabaseGuest, 'id' | 'created_at'>[]): Promise<boolean> {
    try {
      // Deletar acompanhantes existentes
      await this.deleteGuestsByRSVPId(rsvpId);

      // Criar novos acompanhantes se houver
      if (guests.length > 0) {
        return await this.createGuests(guests);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar acompanhantes:', error);
      return false;
    }
  }
}