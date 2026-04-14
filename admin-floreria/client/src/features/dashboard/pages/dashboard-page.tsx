import { Suspense } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Loading from "@/shared/components/loading";
import useDashboard from "../hooks/use-dashboard";
import { Layout, Section, Header } from "../components/dashboard-layout";
import DashboardStats from "../components/dashboard-stats";
import RecentOrders from "../components/recent-orders";
import ErrorState from "../components/error-state";
import { ChartAreaInteractive } from "../components/chart-area-interactive";

// Componente de loading específico para el dashboard
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
      <div className="text-center space-y-4">
        <Loading />
        <p className="text-sm text-muted-foreground">Cargando datos del dashboard...</p>
      </div>
    </div>
  );
}

// Componente principal del dashboard
export default function DashboardPage() {
  const { stats, recentOrders, isLoading, error, refreshData } = useDashboard();

  // Función para manejar la navegación a un pedido específico
  const handleViewOrder = (orderId: string) => {
    // TODO: Implementar navegación a la página del pedido
    console.log("Ver pedido:", orderId);
  };

  // Acciones del header
  const headerActions = (
    <Button
      variant="outline"
      size="sm"
      onClick={refreshData}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Actualizando...' : 'Actualizar'}
    </Button>
  );

  // Estado de error
  if (error && !isLoading) {
    return (
      <Layout>
        <Header 
          title="Dashboard" 
          subtitle="Panel de control administrativo"
          actions={headerActions}
        />
        <Section className="flex justify-center items-center min-h-[400px]">
          <ErrorState
            error={error}
            onRetry={refreshData}
            title="Error en el dashboard"
          />
        </Section>
      </Layout>
    );
  }

  // Estado de loading inicial
  if (isLoading && !stats.totalOrders && !recentOrders.length) {
    return <DashboardLoading />;
  }

  return (
    <Layout>
      {/* Header del dashboard */}
      <Header 
        title="Dashboard" 
        subtitle="Resumen de tu negocio y actividad reciente"
        actions={headerActions}
      />

      {/* Tarjetas de estadísticas */}
      <Section>
        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded-lg" />}>
          <DashboardStats stats={stats} />
        </Suspense>
      </Section>

      {/* Gráfico interactivo */}
      <Section>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Análisis de Ventas</h2>
          <Suspense fallback={<div className="h-80 animate-pulse bg-gray-100 rounded-lg" />}>
            <ChartAreaInteractive />
          </Suspense>
        </div>
      </Section>

      {/* Pedidos recientes */}
      <Section>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Actividad Reciente</h2>
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-lg" />}>
            <RecentOrders 
              orders={recentOrders} 
              onViewOrder={handleViewOrder}
            />
          </Suspense>
        </div>
      </Section>
    </Layout>
  );
}
