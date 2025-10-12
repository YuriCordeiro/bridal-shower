import { supabase } from '@/lib/supabase';

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
}

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'gift-images';

  // Fazer upload de uma imagem para o Supabase Storage
  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Validar o arquivo
      if (!file) {
        return {
          success: false,
          error: 'Nenhum arquivo selecionado'
        };
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Tipo de arquivo não suportado. Use: JPG, PNG, GIF ou WebP'
        };
      }

      // Validar tamanho (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Arquivo muito grande. Máximo 5MB'
        };
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gifts/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        return {
          success: false,
          error: `Erro no upload: ${error.message}`
        };
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return {
          success: false,
          error: 'Erro ao obter URL da imagem'
        };
      }

      return {
        success: true,
        imageUrl: urlData.publicUrl,
        message: 'Imagem enviada com sucesso!'
      };

    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro interno no upload'
      };
    }
  }

  // Deletar uma imagem do Supabase Storage
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extrair o caminho do arquivo da URL
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(-2).join('/'); // Pega 'gifts/filename.ext'

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  // Verificar se o bucket existe e criar se necessário
  static async ensureBucketExists(): Promise<boolean> {
    try {
      // Tentar listar arquivos do bucket (se existir)
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      // Se não houver erro, o bucket existe
      if (!error) {
        return true;
      }

      // Se o erro for de bucket não encontrado, tentar criar
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        const { error: createError } = await supabase.storage
          .createBucket(this.BUCKET_NAME, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
          });

        if (createError) {
          console.error('Erro ao criar bucket:', createError);
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar/criar bucket:', error);
      return false;
    }
  }
}