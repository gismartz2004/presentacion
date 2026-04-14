// Main page component
export { default } from "./pages/dashboard-page";
export { default as DashboardPage } from "./pages/dashboard-page";

// Hook
export { default as useDashboard } from "./hooks/use-dashboard";

// Layout components
export { 
  Layout as DashboardLayout,
  Section as DashboardSection,
  Header as DashboardHeader
} from "./components/dashboard-layout";

// Feature components
export { default as DashboardStats } from "./components/dashboard-stats";
export { default as StatCard } from "./components/stat-card";
export { default as RecentOrders } from "./components/recent-orders";
export { default as ErrorState } from "./components/error-state";
export { default as ChartAreaInteractive } from "./components/chart-area-interactive";

// Legacy components (mantener por compatibilidad)
export { AdminSectionCards } from "./components/admin-section-card";
export { AdminRecentOrders } from "./components/admin-recent-orders";

// Types
export type { Stats, RecentOrder } from "./types";