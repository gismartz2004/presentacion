import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { Order } from "../types";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  getStatusColor,
  getStatusText,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Pedido #{order.orderNumber}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-1">
                Información del Cliente
              </h3>
              <div>
                <p className="font-medium text-lg">{order.customerName}</p>
                <p className="text-gray-600">{order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="text-gray-600">{order.customerPhone}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-1">
                Estado del Pedido
              </h3>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </div>

          {order.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-1">
                Notas Especiales
              </h3>
              <p className="text-gray-600 bg-blue-50 p-3 rounded">
                {order.notes}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-1">
              Productos Ordenados
            </h3>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-lg">{item.product.name}</p>
                      {item.variantName && (
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
                          {item.variantName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="bg-green-100 px-2 py-1 rounded">
                        Precio unitario: ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total del Pedido:</span>
              <span className="text-2xl font-bold text-green-600">
                ${(order.totalAmount ?? 0).toFixed(2)}
              </span>
            </div>
            {Number(order.discountAmount || order.estimatedDiscountAmount || 0) > 0 && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-700">
                <span className="font-medium">
                  Incluye descuento{order.discountCode ? ` (${order.discountCode})` : ""}
                </span>
                <span className="font-semibold text-green-700">
                  -${Number(order.discountAmount || order.estimatedDiscountAmount || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}