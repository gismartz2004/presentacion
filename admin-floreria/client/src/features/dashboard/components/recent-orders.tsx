import { memo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Eye } from "lucide-react";
import type { RecentOrder } from "../types";

// Constantes para evitar recreación en cada render
const STATUS_CONFIG = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    text: "Pendiente"
  },
  CONFIRMED: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    text: "Confirmado"
  },
  PREPARING: {
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    text: "Preparando"
  },
  READY: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    text: "Listo"
  },
  DELIVERED: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    text: "Entregado"
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    text: "Cancelado"
  }
} as const;

interface OrderItemProps {
  order: RecentOrder;
  onViewOrder?: (orderId: string) => void;
}

// Componente memoizado para cada pedido individual
const OrderItem = memo(({ order, onViewOrder }: OrderItemProps) => {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    text: order.status
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = () => {
    onViewOrder?.(order.id);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <p className="font-medium text-sm truncate">
            Pedido #{order.id.slice(-8)}
          </p>
          <Badge className={`text-xs ${statusConfig.color}`}>
            {statusConfig.text}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="truncate">{order.customerName}</span>
          <span className="flex-shrink-0">{formatDate(order.createdAt)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4">
        <div className="text-right">
          <p className="font-semibold text-sm">
            ${order.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.orderItems?.length || 0} items
          </p>
        </div>
        
        {onViewOrder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewOrder}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

OrderItem.displayName = "OrderItem";

interface RecentOrdersProps {
  orders: RecentOrder[];
  onViewOrder?: (orderId: string) => void;
  className?: string;
}

function RecentOrders({ orders, onViewOrder, className }: RecentOrdersProps) {
  if (!orders.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Últimos pedidos procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay pedidos recientes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
        <CardDescription>
          Últimos {orders.length} pedidos procesados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {orders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onViewOrder={onViewOrder}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(RecentOrders);