import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Order } from "../types";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  statusOptions: { value: string; label: string }[];
}

export default function OrderCard({
  order,
  onViewDetails,
  onStatusChange,
  getStatusColor,
  getStatusText,
  statusOptions,
}: OrderCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold text-primary">
              #{order.orderNumber}
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 text-right">
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div>
          <CardTitle className="text-lg">{order.customerName}</CardTitle>
          <CardDescription>{order.customerEmail}</CardDescription>
          {order.customerPhone && (
            <CardDescription className="text-sm">
              {order.customerPhone}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-green-600">
                ${(order.totalAmount ?? 0).toFixed(2)}
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {order.orderItems.length} producto
                {order.orderItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {order.notes && (
            <div className="text-sm text-gray-600 italic bg-blue-50 p-2 rounded">
              <span className="font-medium">Nota:</span> {order.notes}
            </div>
          )}

          <div className="space-x-2 pt-2 grid grid-cols-6">
            <Button
              variant="outline"
              onClick={() => onViewDetails(order)}
              className="col-span-6 md:col-span-3 lg:col-span-4"
            >
              Ver detalles
            </Button>
            {order.status !== "DELIVERED" &&
              order.status !== "CANCELLED" && (
                <Select
                  value={order.status || ""}
                  onValueChange={(e) => onStatusChange(order.id, e)}
                >
                  <SelectTrigger className="w-full col-span-6 md:col-span-3 lg:col-span-2">
                    <SelectValue placeholder="Seleccionar Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cambiar estado:</SelectLabel>
                      {statusOptions
                        .filter((option) => option.value !== "ALL")
                        .map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.value === order.status}
                          >
                            {option.label}
                            {option.value === order.status && " (actual)"}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
