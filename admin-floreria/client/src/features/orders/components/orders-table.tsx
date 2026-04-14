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
import { Eye } from "lucide-react";
import type { Order } from "../types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { LocalDate } from "@/core/utils/date";

interface OrdersTableProps {
  items: Order[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onTogglePage: (ids: string[]) => void;
  allPageSelected: boolean;
  getStatusColor: (s: string) => string;
  getStatusText: (s: string) => string;
  onOpen: (o: Order) => void;
  onChangeStatus: (id: string, status: string) => void;
  statusOptions: { value: string; label: string }[];
}

export function OrdersTable({
  items,
  selectedIds,
  onToggleSelect,
  onTogglePage,
  allPageSelected,
  getStatusColor,
  getStatusText,
  onOpen,
  onChangeStatus,
  statusOptions,
}: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={allPageSelected}
                onCheckedChange={(checked) =>
                  onTogglePage(checked ? items.map((o) => o.id) : [])
                }
              />
            </TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Pendiente</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(order.id)}
                  onCheckedChange={() => onToggleSelect(order.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold">#{order.orderNumber}</span>
                  <div className="flex flex-wrap gap-1">
                    {order.cashOnDelivery && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                        Reserva $7
                      </Badge>
                    )}
                    {order.couponDiscountCode && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                        Cupón: {order.couponDiscountCode}
                      </Badge>
                    )}
                    {Number(order.code_discounted_amount || 0) > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                        Código
                      </Badge>
                    )}
                    {Number(order.product_discounted_amount || 0) > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                        Promoción
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600">
                {new LocalDate(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                ${(order.total || order.totalAmount || 0).toFixed(2)}
              </TableCell>
              <TableCell className="font-semibold">
                {order.pendingAmount && order.pendingAmount > 0 ? (
                  <span className="text-amber-600">${order.pendingAmount.toFixed(2)}</span>
                ) : order.cashOnDelivery ? (
                  <span className="text-amber-600">${((order.total || order.totalAmount || 0) - 7).toFixed(2)}</span>
                ) : (
                  <span className="text-gray-400">$0.00</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpen(order)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {order.status !== "DELIVERED" &&
                    order.status !== "CANCELLED" && (
                      <Select
                        onValueChange={(value) =>
                          onChangeStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[150px] h-8 text-sm">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Cambiar a:</SelectLabel>
                            {statusOptions
                              .filter(
                                (o) =>
                                  o.value !== "ALL" && o.value !== order.status
                              )
                              .map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
