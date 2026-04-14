import { memo } from "react";
import { 
  IconCash, 
  IconShoppingCart, 
  IconClock, 
  IconPackage 
} from "@tabler/icons-react";
import StatCard from "./stat-card";
import type { Stats } from "../types";

interface DashboardStatsProps {
  stats: Stats;
}

function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-2 @7xl/main:grid-cols-4">
      <StatCard
        title="Ingresos Totales"
        value={stats.totalRevenue}
        change={stats.revenueChange}
        format="currency"
        icon={<IconCash className="w-5 h-5" />}
        description="Ingresos acumulados del período"
      />
      
      <StatCard
        title="Pedidos Totales"
        value={stats.totalOrders}
        change={stats.ordersChange}
        icon={<IconShoppingCart className="w-5 h-5" />}
        description="Total de pedidos procesados"
      />
      
      <StatCard
        title="Pedidos Pendientes"
        value={stats.pendingOrders}
        icon={<IconClock className="w-5 h-5" />}
        description="Pedidos en espera de procesamiento"
      />
      
      <StatCard
        title="Total Productos"
        value={stats.totalProducts}
        icon={<IconPackage className="w-5 h-5" />}
        description="Productos en inventario"
      />
    </div>
  );
}

export default memo(DashboardStats);