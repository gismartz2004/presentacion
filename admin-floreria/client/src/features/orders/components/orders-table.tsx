import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Eye, DollarSign } from "lucide-react";
import type { Order } from "../types";
import { LocalDate } from "@/core/utils/date";

// Siguiente estado lógico en el flujo operativo
const NEXT_STATUS: Record<string, { value: string; label: string; cls: string }> = {
  PENDING:   { value: "CONFIRMED",  label: "Confirmar",  cls: "border-blue-400 text-blue-700 hover:bg-blue-50" },
  CONFIRMED: { value: "PREPARING",  label: "Preparar",   cls: "border-orange-400 text-orange-700 hover:bg-orange-50" },
  PREPARING: { value: "READY",      label: "Listo",      cls: "border-green-500 text-green-700 hover:bg-green-50" },
  READY:     { value: "DELIVERED",  label: "Entregar",   cls: "border-gray-400 text-gray-700 hover:bg-gray-50" },
};

interface OrdersTableProps {
  items: Order[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onTogglePage: (ids: string[]) => void;
  allPageSelected: boolean;
  getStatusColor: (s: string) => string;
  getStatusText: (s: string) => string;
  getPaymentStatusColor: (s: string) => string;
  getPaymentStatusText: (s: string) => string;
  onOpen: (o: Order) => void;
  onChangeStatus: (id: string, status: string) => void;
  onMarkAsPaid: (id: string) => void;
  statusOptions: { value: string; label: string }[];
  isLoading?: boolean;
}

export function OrdersTable({
  items,
  selectedIds,
  onToggleSelect,
  onTogglePage,
  allPageSelected,
  getStatusColor,
  getStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  onOpen,
  onChangeStatus,
  onMarkAsPaid,
  isLoading,
}: OrdersTableProps) {
  return (
    <div className="overflow-x-auto relative">
      {/* Indicador de carga inline — no bloquea la tabla */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-start justify-center pt-16 z-10 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border rounded-full px-4 py-2 shadow-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            Actualizando...
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="w-10">
              <Checkbox
                checked={allPageSelected}
                onCheckedChange={(checked) =>
                  onTogglePage(checked ? items.map((o) => o.id) : [])
                }
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-800">Orden</TableHead>
            <TableHead className="font-semibold text-gray-800">Cliente</TableHead>
            <TableHead className="font-semibold text-gray-800">Estado</TableHead>
            <TableHead className="font-semibold text-gray-800">Pago</TableHead>
            <TableHead className="font-semibold text-gray-800">Fecha</TableHead>
            <TableHead className="text-right font-semibold text-gray-800">Total</TableHead>
            <TableHead className="text-right font-semibold text-gray-800">Pendiente</TableHead>
            <TableHead className="text-center font-semibold text-gray-800">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((order) => {
            const next = NEXT_STATUS[order.status];
            const canMarkPaid =
              order.paymentStatus !== "PAID" && !order.clientTransactionId;

            return (
              <TableRow
                key={order.id}
                className={`cursor-pointer transition-colors ${
                  order.status === "PENDING"
                    ? "bg-amber-50/50 hover:bg-amber-50"
                    : order.status === "CANCELLED"
                    ? "opacity-60 hover:bg-gray-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onOpen(order)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(order.id)}
                    onCheckedChange={() => onToggleSelect(order.id)}
                  />
                </TableCell>

                {/* Número de orden + badges de descuentos */}
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">#{order.orderNumber}</span>
                    <div className="flex flex-wrap gap-1">
                      {order.cashOnDelivery && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                          Reserva $7
                        </Badge>
                      )}
                      {order.couponDiscountCode && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                          {order.couponDiscountCode}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Cliente: nombre + email + teléfono */}
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-gray-500">{order.customerEmail}</div>
                    {order.customerPhone && (
                      <div className="text-gray-400">{order.customerPhone}</div>
                    )}
                  </div>
                </TableCell>

                {/* Estado del pedido */}
                <TableCell>
                  <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>

                {/* Estado del pago */}
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </Badge>
                </TableCell>

                {/* Fecha */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  {new LocalDate(order.createdAt).toLocaleDateString()}
                </TableCell>

                {/* Total */}
                <TableCell className="text-right font-semibold text-green-700 whitespace-nowrap">
                  ${(order.total || order.totalAmount || 0).toFixed(2)}
                </TableCell>

                {/* Pendiente */}
                <TableCell className="text-right whitespace-nowrap">
                  {order.pendingAmount && order.pendingAmount > 0 ? (
                    <span className="text-amber-600 font-semibold">${order.pendingAmount.toFixed(2)}</span>
                  ) : order.cashOnDelivery ? (
                    <span className="text-amber-600 font-semibold">
                      ${((order.total || order.totalAmount || 0) - 7).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>

                {/* Acciones: no propagan el clic al row */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Botón avance rápido en el flujo */}
                    {next && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs font-medium ${next.cls}`}
                        onClick={() => onChangeStatus(order.id, next.value)}
                      >
                        {next.label}
                      </Button>
                    )}

                    {/* Marcar como pagado — solo transferencias pendientes */}
                    {canMarkPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-green-400 text-green-700 hover:bg-green-50"
                        title="Marcar como pagado"
                        onClick={() => onMarkAsPaid(order.id)}
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Ver detalle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      title="Ver detalle"
                      onClick={() => onOpen(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
