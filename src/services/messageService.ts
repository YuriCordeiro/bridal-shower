import { supabase, SupabaseMessage, SupabaseRSVP } from '@/lib/supabase';

export class MessageService {
  // Buscar todas as mensagens (incluindo de RSVPs)
  static async getAllMessages(): Promise<SupabaseMessage[]> {
    try {
      const messages: SupabaseMessage[] = [];

      // Buscar mensagens das confirmações de presença (RSVPs)
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('id, name, last_name, message, created_at')
        .not('message', 'is', null)
        .not('message', 'eq', '')
        .order('created_at', { ascending: false });

      if (rsvpError) {
        console.error('Erro ao buscar mensagens dos RSVPs:', rsvpError);
      } else if (rsvps) {
        // Converter RSVPs para formato de mensagem
        const rsvpMessages = rsvps.map(rsvp => ({
          id: `rsvp_${rsvp.id}`,
          sender_name: `${rsvp.name} ${rsvp.last_name}`,
          message: rsvp.message || '',
          created_at: rsvp.created_at
        }));
        messages.push(...rsvpMessages);
      }

      // Buscar mensagens da tabela dedicada (se existir)
      const { data: directMessages, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messageError && messageError.code !== 'PGRST116') {
        // PGRST116 = table not found, isso é OK se a tabela não existir
        console.error('Erro ao buscar mensagens diretas:', messageError);
      } else if (directMessages) {
        messages.push(...directMessages);
      }

      // Ordenar todas as mensagens por data
      return messages.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  // Buscar estatísticas das mensagens
  static async getMessageStats(): Promise<{
    total: number;
    fromRSVPs: number;
    fromDirect: number;
    thisWeek: number;
  }> {
    try {
      const allMessages = await this.getAllMessages();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const fromRSVPs = allMessages.filter(msg => msg.id?.startsWith('rsvp_')).length;
      const fromDirect = allMessages.filter(msg => !msg.id?.startsWith('rsvp_')).length;
      const thisWeek = allMessages.filter(msg => {
        const msgDate = new Date(msg.created_at || 0);
        return msgDate >= oneWeekAgo;
      }).length;

      return {
        total: allMessages.length,
        fromRSVPs,
        fromDirect,
        thisWeek
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas de mensagens:', error);
      return {
        total: 0,
        fromRSVPs: 0,
        fromDirect: 0,
        thisWeek: 0
      };
    }
  }

  // Criar nova mensagem
  static async createMessage(message: Omit<SupabaseMessage, 'id' | 'created_at'>): Promise<SupabaseMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar mensagem:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      return null;
    }
  }

  // Buscar mensagem por ID
  static async getMessageById(id: string): Promise<SupabaseMessage | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar mensagem:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error);
      return null;
    }
  }

  // Deletar mensagem
  static async deleteMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar mensagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      return false;
    }
  }

  // Buscar mensagens recentes (últimas 10)
  static async getRecentMessages(limit: number = 10): Promise<SupabaseMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar mensagens recentes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar mensagens recentes:', error);
      return [];
    }
  }
}