import { supabase, SupabaseRSVP } from '@/lib/supabase';

export class RSVPService {
  // Criar um novo RSVP
  static async createRSVP(rsvp: Omit<SupabaseRSVP, 'id' | 'created_at'>): Promise<SupabaseRSVP | null> {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .insert([rsvp])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar RSVP:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar RSVP:', error);
      return null;
    }
  }

  // Buscar todos os RSVPs
  static async getAllRSVPs(): Promise<SupabaseRSVP[]> {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar RSVPs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar RSVPs:', error);
      return [];
    }
  }

  // Buscar RSVP por ID
  static async getRSVPById(id: string): Promise<SupabaseRSVP | null> {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar RSVP:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar RSVP:', error);
      return null;
    }
  }

  // Atualizar RSVP
  static async updateRSVP(id: string, updates: Partial<SupabaseRSVP>): Promise<SupabaseRSVP | null> {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar RSVP:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar RSVP:', error);
      return null;
    }
  }

  // Deletar RSVP
  static async deleteRSVP(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar RSVP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar RSVP:', error);
      return false;
    }
  }

  // Estatísticas dos RSVPs
  static async getRSVPStats(): Promise<{
    total: number;
    confirmed: number;
    declined: number;
  }> {
    try {
      const rsvps = await this.getAllRSVPs();
      
      const confirmed = rsvps.filter(r => r.attendance === 'sim');
      const declined = rsvps.filter(r => r.attendance === 'nao');

      return {
        total: rsvps.length,
        confirmed: confirmed.length,
        declined: declined.length
      };

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        confirmed: 0,
        declined: 0
      };
    }
  }
}