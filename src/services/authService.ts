import { supabase, SupabaseAdminUser } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

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
  // Fazer login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        return {
          success: false,
          message: 'Usuário e senha são obrigatórios'
        };
      }

      // Buscar usuário no Supabase
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'Usuário não encontrado ou inativo'
        };
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Senha incorreta'
        };
      }

      // Atualizar último login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Remover hash da senha antes de retornar
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
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

  // Verificar se usuário está logado (usando localStorage)
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return false;

    try {
      const { expiry } = JSON.parse(authData);
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  // Salvar sessão no localStorage
  static saveSession(user: SupabaseAdminUser): void {
    if (typeof window === 'undefined') return;

    const sessionData = {
      user,
      expiry: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      loginTime: Date.now()
    };

    localStorage.setItem('adminAuth', JSON.stringify(sessionData));
  }

  // Obter dados do usuário da sessão
  static getSessionUser(): SupabaseAdminUser | null {
    if (typeof window === 'undefined') return null;

    const authData = localStorage.getItem('adminAuth');
    if (!authData) return null;

    try {
      const { user, expiry } = JSON.parse(authData);
      if (Date.now() >= expiry) {
        this.logout();
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  // Fazer logout
  static logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminAuth');
  }

  // Criar novo usuário administrativo (só para outros admins)
  static async createUser(userData: {
    username: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    try {
      const { username, password } = userData;

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return {
          success: false,
          message: 'Nome de usuário já existe'
        };
      }

      // Gerar hash da senha
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const { data: newUser, error } = await supabase
        .from('admin_users')
        .insert([{
          username,
          password_hash,
        }])
        .select()
        .single();

      if (error || !newUser) {
        return {
          success: false,
          message: 'Erro ao criar usuário'
        };
      }

      // Remover hash da senha antes de retornar
      const { password_hash: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
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
      // Verificar senha atual
      const loginResult = await this.login({ username, password: currentPassword });
      
      if (!loginResult.success) {
        return {
          success: false,
          message: 'Senha atual incorreta'
        };
      }

      // Gerar hash da nova senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha no banco
      const { error } = await supabase
        .from('admin_users')
        .update({ password_hash: newPasswordHash })
        .eq('username', username);

      if (error) {
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

  // Listar todos os usuários (para gerenciamento)
  static async getAllUsers(): Promise<SupabaseAdminUser[]> {
    try {
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('id, username, created_at, last_login')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return users || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
}