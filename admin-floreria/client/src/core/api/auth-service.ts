import service from './service';
import type { User } from '@/store/use-user-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data?: {
    admin: User;
  };
}

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await service.post('/admin/login', credentials);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await service.post('/admin/logout');
  },

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<{ status: string; data?: { admin: User } }> {
    const response = await service.get('/admin/metadata');
    return response.data;
  },

  /**
   * Verificar si la sesión está activa
   */
  async verifySession(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.status === 'success' && !!response.data?.admin;
    } catch {
      return false;
    }
  },

  /**
   * Refrescar datos del usuario (para usar con el session timeout)
   */
  async refreshUserData(): Promise<User | null> {
    try {
      const response = await this.getCurrentUser();
      return response.data?.admin || null;
    } catch {
      return null;
    }
  }
};