import { supabase, SupabaseMessage } from '@/lib/supabase';

export class MessageService {
  // Buscar todas as mensagens
  static async getAllMessages(): Promise<SupabaseMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
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

  // Estatísticas das mensagens
  static async getMessageStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
  }> {
    try {
      const messages = await this.getAllMessages();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const todayMessages = messages.filter(m => {
        const messageDate = new Date(m.created_at!);
        messageDate.setHours(0, 0, 0, 0);
        return messageDate.getTime() === today.getTime();
      });

      const weekMessages = messages.filter(m => {
        const messageDate = new Date(m.created_at!);
        return messageDate >= weekAgo;
      });

      return {
        total: messages.length,
        today: todayMessages.length,
        thisWeek: weekMessages.length
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0
      };
    }
  }
}