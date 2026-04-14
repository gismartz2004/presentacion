import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { RecentOrder, Stats } from "../types";
import dashboard_stats from "../api/dashboard";

// Estados iniciales como constantes para evitar recreación
const INITIAL_STATS: Stats = {
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  revenueChange: {
    value: 0,
    direction: "increase",
  },
  ordersChange: {
    value: 0,
    direction: "increase",
  },
};

const INITIAL_ORDERS: RecentOrder[] = [];

export default function useDashboard() {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(INITIAL_ORDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar errores de forma consistente
  const handleError = useCallback((error: unknown, context: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Dashboard ${context} error:`, error);
    setError(`Error al cargar ${context}: ${errorMessage}`);
    toast.error(`Error al cargar ${context}`);
  }, []);

  // Función para obtener estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboard_stats.statesman();
      setStats({
        totalProducts: 0, // TODO: Add products endpoint
        totalOrders: data.orders?.total ?? 0,
        pendingOrders: data.pendingOrders ?? 0,
        totalRevenue: data.revenue?.total ?? 0,
        revenueChange: data.revenue?.change ?? INITIAL_STATS.revenueChange,
        ordersChange: data.orders?.change ?? INITIAL_STATS.ordersChange,
      });
    } catch (error) {
      handleError(error, 'estadísticas');
      setStats(INITIAL_STATS);
    }
  }, [handleError]);

  // Función para obtener pedidos recientes
  const fetchRecentOrders = useCallback(async () => {
    try {
      const recentOrdersData = await dashboard_stats.getOrderLimit(5);
      setRecentOrders(recentOrdersData.orders ?? []);
    } catch (error) {
      handleError(error, 'pedidos recientes');
      setRecentOrders(INITIAL_ORDERS);
    }
  }, [handleError]);

  // Función principal para cargar todos los datos
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ejecutar ambas peticiones en paralelo para mejor rendimiento
      await Promise.all([fetchStats(), fetchRecentOrders()]);
    } catch (error) {
      // Los errores individuales ya se manejan en fetchStats y fetchRecentOrders
      console.error("Dashboard general error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchRecentOrders]);

  // Función para refrescar los datos
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { 
    stats, 
    recentOrders, 
    isLoading, 
    error, 
    refreshData 
  };
}
