import { supabase, SupabaseEventInfo } from '@/lib/supabase';

export class EventService {
  // Buscar informações do evento
  static async getEventInfo(): Promise<SupabaseEventInfo | null> {
    try {
      const { data, error } = await supabase
        .from('event_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar informações do evento:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar informações do evento:', error);
      return null;
    }
  }

  // Criar informações do evento
  static async createEventInfo(eventInfo: Omit<SupabaseEventInfo, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseEventInfo | null> {
    try {
      const { data, error } = await supabase
        .from('event_info')
        .insert([eventInfo])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar informações do evento:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar informações do evento:', error);
      return null;
    }
  }

  // Atualizar informações do evento
  static async updateEventInfo(id: string, updates: Partial<SupabaseEventInfo>): Promise<SupabaseEventInfo | null> {
    try {
      const { data, error } = await supabase
        .from('event_info')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar informações do evento:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar informações do evento:', error);
      return null;
    }
  }

  // Formatar data para exibição
  static formatEventDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Formatar hora para exibição
  static formatEventTime(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return timeString;
    }
  }
}