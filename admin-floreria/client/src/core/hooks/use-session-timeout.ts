import { useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/use-user-store';
import service from '@/core/api/service';
// import { AxiosError } from 'axios';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milliseconds
const CHECK_INTERVAL = 60 * 1000; // Verificar cada minuto

export function useSessionTimeout() {
  // Map to existing store fields
  const { user, lastFetchedAt, clearUser, markFetchedNow } = useUserStore();
  const isAuthenticated = !!user;

  const logout = useCallback(async () => {
    try {
      // Llamar al endpoint de logout
      await service.post('/admin/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar estado local
      clearUser();
      window.location.href = '/auth/login';
    }
  }, [clearUser]);

  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

  const now = Date.now();
  const timeSinceLastActivity = now - lastFetchedAt;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      console.log('Session expired due to inactivity');
      logout();
    }
  }, [isAuthenticated, lastFetchedAt, logout]);

  // Verificar session timeout periodicamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(checkSession, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  // Verificar session validity con el servidor periodicamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const verifySession = async () => {
      try {
  await service.get('/admin/metadata');
  markFetchedNow();
      } catch (error) {
        if (error instanceof Error && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            console.log('Session invalid on server');
            clearUser();
          }
        }
      }
    };

    // Verificar session con el servidor cada 5 minutos
    const interval = setInterval(verifySession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, markFetchedNow, clearUser]);

  return {
    logout,
    checkSession,
    timeoutWarning: () => {
  const now = Date.now();
  const timeSinceLastActivity = now - lastFetchedAt;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceLastActivity;
      
      // Mostrar warning si quedan menos de 5 minutos
      return timeUntilTimeout < 5 * 60 * 1000 && timeUntilTimeout > 0;
    }
  };
}