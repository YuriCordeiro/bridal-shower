import { supabase, SupabaseAdminUser } from '@/lib/supabase';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: SupabaseAdminUser;
  message?: string;
}

export class AuthService {
  // Fazer login usando autenticação nativa do Supabase
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        return {
          success: false,
          message: 'Usuário e senha são obrigatórios'
        };
      }

      // Usar autenticação nativa do Supabase com email
      // Para compatibilidade, vamos usar username@admin.local como email
      const adminEmail = `${username}@admin.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Falha na autenticação'
        };
      }

      // Salvar dados do usuário no localStorage
      const userData = {
        id: data.user.id,
        username: username,
        email: adminEmail,
        created_at: data.user.created_at,
        last_login: new Date().toISOString()
      };

      localStorage.setItem('adminAuth', JSON.stringify({
        isAuthenticated: true,
        user: userData,
        token: data.session?.access_token,
        expiresAt: data.session?.expires_at
      }));

      return {
        success: true,
        user: userData as SupabaseAdminUser,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // Verificar se usuário está logado
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return false;

    try {
      const parsed = JSON.parse(authData);
      const { isAuthenticated, expiresAt } = parsed;
      
      // Verificar se ainda está válido
      if (expiresAt && Date.now() > expiresAt * 1000) {
        this.logout();
        return false;
      }
      
      return isAuthenticated === true;
    } catch {
      this.logout();
      return false;
    }
  }

  // Obter dados do usuário da sessão
  static getSessionUser(): SupabaseAdminUser | null {
    if (typeof window === 'undefined') return null;

    const authData = localStorage.getItem('adminAuth');
    if (!authData) return null;

    try {
      const parsed = JSON.parse(authData);
      const { user, isAuthenticated, expiresAt } = parsed;
      
      // Verificar se ainda está válido
      if (expiresAt && Date.now() > expiresAt * 1000) {
        this.logout();
        return null;
      }
      
      return isAuthenticated ? user : null;
    } catch {
      this.logout();
      return null;
    }
  }

  // Fazer logout
  static async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Fazer logout do Supabase também
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout do Supabase:', error);
    }
    
    localStorage.removeItem('adminAuth');
  }

  // Criar novo usuário administrativo (usar com cuidado - apenas para setup inicial)
  static async createUser(userData: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const { username, password } = userData;

      if (!username || !password) {
        return {
          success: false,
          message: 'Usuário e senha são obrigatórios'
        };
      }

      // Criar usuário usando autenticação nativa do Supabase
      const adminEmail = `${username}@admin.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: password,
        options: {
          data: {
            username: username,
            role: 'admin'
          }
        }
      });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        return {
          success: false,
          message: error.message || 'Erro ao criar usuário'
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Falha ao criar usuário'
        };
      }

      const newUser = {
        id: data.user.id,
        username: username,
        email: adminEmail,
        created_at: data.user.created_at
      };

      return {
        success: true,
        user: newUser as SupabaseAdminUser,
        message: 'Usuário criado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // Alterar senha
  static async changePassword(
    username: string,
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      // Verificar senha atual fazendo login
      const loginResult = await this.login({ username, password: currentPassword });
      
      if (!loginResult.success) {
        return {
          success: false,
          message: 'Senha atual incorreta'
        };
      }

      // Alterar senha usando a API do Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Erro ao alterar senha:', error);
        return {
          success: false,
          message: 'Erro ao alterar senha'
        };
      }

      return {
        success: true,
        message: 'Senha alterada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // Listar todos os usuários (para gerenciamento) - Funcionalidade desabilitada devido ao RLS
  static async getAllUsers(): Promise<SupabaseAdminUser[]> {
    try {
      // Como o RLS bloqueia acesso direto à tabela admin_users,
      // esta funcionalidade precisa ser implementada via Supabase Auth Admin API
      // ou através de uma função do servidor/Edge Function
      console.warn('getAllUsers: Funcionalidade desabilitada devido às políticas RLS');
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
}