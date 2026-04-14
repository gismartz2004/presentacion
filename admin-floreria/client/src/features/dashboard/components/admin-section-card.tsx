import {
  IconTrendingUp,
  IconTrendingDown,
  //   IconPackage,
  IconClock,
} from "@tabler/icons-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Stats } from "../types";

type AdminStatsProps = {
  stats: Stats;
};

export function AdminSectionCards({ stats }: AdminStatsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos Totales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${stats.totalRevenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.revenueChange.direction === "increase" ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.revenueChange.value}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueChange.direction === "increase"
              ? "Crecimiento este mes"
              : "Disminución este mes"}
            {stats.revenueChange.direction === "increase" ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Ingresos de los últimos 6 meses
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Pedidos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.ordersChange.direction === "increase" ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.ordersChange.value}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.ordersChange.direction === "increase"
              ? "Aumento en pedidos"
              : "Disminución en pedidos"}
            {stats.ordersChange.direction === "increase" ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Pedidos de los últimos 30 días
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pedidos Pendientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingOrders}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Requieren atención <IconClock className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Pedidos esperando confirmación
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
