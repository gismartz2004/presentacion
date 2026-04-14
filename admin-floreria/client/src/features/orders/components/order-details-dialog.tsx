import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import type { Order } from "../types";
import { LocalDate } from "@/core/utils/date";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  getStatusColor: (s: string) => string;
  getStatusText: (s: string) => string;
}

export function OrderDetailsDialog({
  order,
  open,
  onClose,
  getStatusColor,
  getStatusText,
}: OrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Pedido #{order.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {new LocalDate(order.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <span>
                      <b>Nombre:</b> {order.customerName}
                    </span>
                    <span>
                      <b>Apellido:</b> {order.customerLastName}
                    </span>
                    <span>
                      <b>Email:</b> {order.customerEmail}
                    </span>
                    {order.customerPhone && (
                      <span>
                        <b>Teléfono:</b> {order.customerPhone}
                      </span>
                    )}
                    <span>
                      <b>Provincia:</b> {order.customerProvince}
                    </span>
                    <span>
                      <b>Ciudad:</b> {order.billingCity}
                    </span>
                    <span>
                      <b>Dirección principal:</b>{" "}
                      {order.billingPrincipalAddress}
                    </span>
                    <span>
                      <b>Dirección secundaria:</b> {order.billingSecondAddress}
                    </span>
                    <span>
                      <b>Referencia:</b> {order.customerReference}
                    </span>
                    <span>
                      <b>Contacto:</b> {order.billingContactName}
                    </span>
                    <span>
                      <b>Courier:</b> {order.Courier}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">
                    Estado y Totales
                  </h3>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <div className="grid grid-cols-1 gap-1 text-sm mt-2">
                    <span>
                      <b>Total:</b> ${order.totalAmount?.toFixed(2)}
                    </span>
                    {Number(order.estimatedDiscountAmount || 0) > 0 && (
                      <span>
                        <b>Descuento:</b> -${Number(order.estimatedDiscountAmount || 0).toFixed(2)}
                        {order.discountCode ? ` (${order.discountCode})` : ""}
                      </span>
                    )}
                    {order.pendingAmount !== undefined &&
                      order.pendingAmount > 0 && (
                        <span>
                          <b>Pendiente:</b> ${order.pendingAmount.toFixed(2)}
                        </span>
                      )}
                    <span>
                      <b>Estado:</b> {getStatusText(order.status)}
                    </span>
                    {order.subtotal !== undefined && (
                      <span>
                        <b>Subtotal:</b> ${Number(order.subtotal || 0).toFixed(2)}
                      </span>
                    )}
                    {order.tax !== undefined && (
                      <span>
                        <b>Impuesto:</b> ${Number(order.tax || 0).toFixed(2)}
                      </span>
                    )}
                    {order.shipping !== undefined && (
                      <span>
                        <b>Reserva:</b> ${Number(order.shipping || 0).toFixed(2)}
                      </span>
                    )}
                    {/* <span><b>Estado de pago:</b> {order.paymentStatus}</span> */}
                    {/* <span><b>Notas de entrega:</b> {order.deliveryNotes || '-'}</span> */}
                    {/* <span><b>Notas de pedido:</b> {order.orderNotes || '-'}</span> */}
                  </div>
                </div>
              </div>
              {order.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">
                    Notas Especiales
                  </h3>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded">
                    {order.description}
                  </p>
                </div>
              )}
              {/**
               * El campo de notas es usado para instrucciones de delivery o retiro
               * Si en el futuro se agrega un campo específico para esto, se puede eliminar este bloque
               * o adaptarlo según sea necesario.
               */}
              {order.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-1">
                    Notas del Pedido
                  </h3>
                  <p className="text-gray-600">{order.notes}</p>
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
                      className="flex justify-between items-start p-3 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">
                            {item.product.name}
                          </span>
                          {item.variantName && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-xs">
                              {item.variantName}
                            </Badge>
                          )}
                          {item.discounts_percents && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                              -{item.discounts_percents}% descuento
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600 mt-2">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Cant: {item.quantity}
                          </span>
                          <span className="bg-green-100 px-2 py-1 rounded">
                            Unit: ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-green-600 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg space-y-2">
                {/* Cálculo del precio original (subtotal + descuentos) */}
                {(() => {
                  const originalPrice = order.subtotal + Number(order.total_discount_amount || 0);
                  const hasDiscounts = Number(order.total_discount_amount || 0) > 0;
                  
                  return (
                    <>
                      {hasDiscounts && (
                        <div className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                          <span className="text-gray-700 font-medium">Precio original productos:</span>
                          <span className="font-medium text-gray-800">${originalPrice.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Desglose de cada tipo de descuento */}
                      {Number(order.product_discounted_amount || 0) > 0 && (
                        <div className="bg-green-50 border border-green-200 p-2 rounded space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-600 text-white text-xs">
                                PROMOCIÓN
                              </Badge>
                              <span className="text-green-900 font-medium">Descuento por promociones activas</span>
                            </div>
                            <span className="font-bold text-green-700">
                              -${Number(order.product_discounted_amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-green-800 ml-1">
                            Productos con descuento promocional aplicado automáticamente
                          </p>
                        </div>
                      )}
                      
                      {Number(order.coupon_discounted_amount || 0) > 0 && (
                        <div className="bg-purple-50 border border-purple-200 p-2 rounded space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-600 text-white text-xs">
                                CUPÓN
                              </Badge>
                              <span className="text-purple-900 font-medium">
                                Cupón: {order.couponDiscountCode}
                                {order.discount_coupon_percent ? ` (${order.discount_coupon_percent}% dto)` : ''}
                              </span>
                            </div>
                            <span className="font-bold text-purple-700">
                              -${Number(order.coupon_discounted_amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-purple-800 ml-1">
                            Descuento aplicado por cupón de fidelización
                          </p>
                        </div>
                      )}
                      
                      {Number(order.code_discounted_amount || 0) > 0 && (
                        <div className="bg-blue-50 border border-blue-200 p-2 rounded space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-600 text-white text-xs">
                                CÓDIGO
                              </Badge>
                              <span className="text-blue-900 font-medium">
                                Código de descuento
                                {order.discount_code_percent ? ` (${order.discount_code_percent}% dto)` : ''}
                              </span>
                            </div>
                            <span className="font-bold text-blue-700">
                              -${Number(order.code_discounted_amount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-blue-800 ml-1">
                            Código de descuento aplicado en el checkout
                          </p>
                        </div>
                      )}
                      
                      {hasDiscounts && (
                        <div className="flex justify-between items-center text-sm bg-green-100 p-2 rounded border-2 border-green-300">
                          <span className="font-bold text-green-900">Total ahorrado:</span>
                          <span className="font-bold text-green-700 text-base">
                            -${Number(order.total_discount_amount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                        <span className="text-gray-700 font-medium">Subtotal después de descuentos:</span>
                        <span className="font-semibold text-gray-900">${order.subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">IVA (15%):</span>
                        <span className="font-medium">${order.tax.toFixed(2)}</span>
                      </div>
                      
                      {Number(order.shipping || 0) > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Costo de envío:</span>
                          <span className="font-medium">${order.shipping.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center border-t-2 pt-3 mt-2 bg-white p-3 rounded">
                        <span className="text-xl font-bold">Total a pagar:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${(order.total || order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      
                      {order.cashOnDelivery && (
                        <div className="border-2 border-amber-300 bg-amber-50 p-3 rounded-lg mt-2 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-600 text-white">
                              PAGO CONTRAENTREGA
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-800 font-medium">Reserva pagada online:</span>
                            <span className="font-semibold text-amber-900">$7.00</span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-amber-300">
                            <span className="text-amber-900 font-bold">Pendiente (pago al recibir):</span>
                            <span className="font-bold text-amber-900 text-lg">
                              ${((order.total || order.totalAmount || 0) - 7).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 mt-1">
                            El cliente pagará el monto pendiente cuando reciba su pedido
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
