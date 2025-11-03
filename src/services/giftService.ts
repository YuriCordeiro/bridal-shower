import { supabase, SupabaseGift } from '@/lib/supabase';

export class GiftService {
  // Buscar todos os presentes
  static async getAllGifts(): Promise<SupabaseGift[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar presentes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar presentes:', error);
      return [];
    }
  }

  // Buscar presentes por categoria
  static async getGiftsByCategory(category: string): Promise<SupabaseGift[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('category', category)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Erro ao buscar presentes por categoria:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar presentes por categoria:', error);
      return [];
    }
  }

  // Buscar presente por ID
  static async getGiftById(id: string): Promise<SupabaseGift | null> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar presente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar presente:', error);
      return null;
    }
  }

  // Criar novo presente
  static async createGift(gift: Omit<SupabaseGift, 'id' | 'created_at'>): Promise<SupabaseGift | null> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .insert([gift])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar presente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar presente:', error);
      return null;
    }
  }

  // Atualizar presente
  static async updateGift(id: string, updates: Partial<SupabaseGift>): Promise<SupabaseGift | null> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar presente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar presente:', error);
      return null;
    }
  }

  // Trocar ordem entre dois presentes
  static async swapGiftOrder(giftId: string, newOrder: number): Promise<boolean> {
    try {
      // Buscar o presente atual
      const currentGift = await this.getGiftById(giftId);
      if (!currentGift) {
        console.error('Presente não encontrado:', giftId);
        return false;
      }

      // Buscar o presente que está na posição de destino (se houver)
      const { data: targetGift, error: targetError } = await supabase
        .from('gifts')
        .select('*')
        .eq('order_index', newOrder)
        .single();

      if (targetError && targetError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar presente na posição de destino:', targetError);
        return false;
      }

      // Se há um presente na posição de destino, trocar as ordens
      if (targetGift && targetGift.id !== currentGift.id) {
        // Atualizar o presente de destino com a ordem atual
        const { error: updateTargetError } = await supabase
          .from('gifts')
          .update({ order_index: currentGift.order_index })
          .eq('id', targetGift.id);

        if (updateTargetError) {
          console.error('Erro ao atualizar ordem do presente de destino:', updateTargetError);
          return false;
        }
      }

      // Atualizar o presente atual com a nova ordem
      const { error: updateCurrentError } = await supabase
        .from('gifts')
        .update({ order_index: newOrder })
        .eq('id', currentGift.id);

      if (updateCurrentError) {
        console.error('Erro ao atualizar ordem do presente atual:', updateCurrentError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao trocar ordem dos presentes:', error);
      return false;
    }
  }

  // Marcar presente como comprado
  static async markGiftAsPurchased(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gifts')
        .update({ purchased: true })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar presente como comprado:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar presente como comprado:', error);
      return false;
    }
  }

  // Deletar presente
  static async deleteGift(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar presente:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar presente:', error);
      return false;
    }
  }

  // Buscar categorias únicas
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
      }

      const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  // Estatísticas dos presentes
  static async getGiftStats(): Promise<{
    total: number;
    purchased: number;
    available: number;
    totalValue: number;
    purchasedValue: number;
  }> {
    try {
      const gifts = await this.getAllGifts();
      
      const purchased = gifts.filter(g => g.purchased);
      const available = gifts.filter(g => !g.purchased);
      const totalValue = gifts.reduce((sum, g) => sum + g.price, 0);
      const purchasedValue = purchased.reduce((sum, g) => sum + g.price, 0);

      return {
        total: gifts.length,
        purchased: purchased.length,
        available: available.length,
        totalValue,
        purchasedValue
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        total: 0,
        purchased: 0,
        available: 0,
        totalValue: 0,
        purchasedValue: 0
      };
    }
  }

  // Obter URL pública da imagem do Supabase
  static getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return '/placeholder-gift.svg';
    }
    
    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Se é apenas o nome do arquivo, constroi a URL do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/gifts/${imagePath}`;
    }
    
    return '/placeholder-gift.svg';
  }
}