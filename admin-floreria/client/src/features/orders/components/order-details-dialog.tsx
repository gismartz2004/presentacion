import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Home,
  Image,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import type { Order } from "../types";
import { LocalDate } from "@/core/utils/date";
import { getImageUrl } from "@/core/utils/variables";
import ecommerceService from "@/core/api/ecommerce-service";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  getStatusColor: (s: string) => string;
  getStatusText: (s: string) => string;
  getPaymentStatusColor: (s: string) => string;
  getPaymentStatusText: (s: string) => string;
  onUpdatePaymentStatus: (id: string, paymentStatus: string) => void;
  onChangeStatus: (id: string, status: string) => void;
  statusOptions: { value: string; label: string }[];
}

function normalizeNoteLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseStorefrontOrderNotes(notes?: string | null) {
  const details: Record<string, string> = {};
  if (!notes) return details;

  notes.split("|").forEach((part) => {
    const [rawLabel, ...valueParts] = part.split(":");
    const value = valueParts.join(":").trim();
    if (!rawLabel || !value) return;

    const label = normalizeNoteLabel(rawLabel);
    const keyByLabel: Record<string, string> = {
      "quien envia": "senderName",
      envia: "senderName",
      "correo de quien envia": "senderEmail",
      "telefono de quien envia": "senderPhone",
      "quien recibe": "receiverName",
      recibe: "receiverName",
      "telefono de quien recibe": "receiverPhone",
      "direccion exacta": "exactAddress",
      sector: "exactAddress",
      "hora de entrega": "deliveryDateTime",
      "fecha entrega": "deliveryDateTime",
      "mensaje para tarjeta": "cardMessage",
      observaciones: "observations",
      "metodo de pago": "paymentMethod",
      "metodo pago": "paymentMethod",
      "comprobante url": "paymentProofImageUrl",
      "comprobante archivo": "paymentProofFileName",
      cupon: "coupon",
    };

    const key = keyByLabel[label];
    if (key) details[key] = value;
  });

  return details;
}

export function OrderDetailsDialog({
  order,
  open,
  onClose,
  getStatusColor,
  getStatusText,
  getPaymentStatusColor,
  getPaymentStatusText,
  onUpdatePaymentStatus,
  onChangeStatus,
  statusOptions,
}: OrderDetailsDialogProps) {
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [paymentProofPreviewUrl, setPaymentProofPreviewUrl] = useState("");
  const initialPaymentProofStatus =
    order?.paymentProofStatus === "VERIFIED" ? "VERIFIED" : "PENDING";
  const [paymentProofStatusValue, setPaymentProofStatusValue] = useState(
    initialPaymentProofStatus
  );

  useEffect(() => {
    setPaymentProofStatusValue(initialPaymentProofStatus);
  }, [initialPaymentProofStatus, order?.id]);

  useEffect(() => {
    let objectUrlToRevoke = "";

    const loadPaymentProofPreview = async () => {
      if (!order?.id) {
        setPaymentProofPreviewUrl("");
        return;
      }

      const proofUrl =
        order.paymentProofImageUrl ||
        parseStorefrontOrderNotes(order.orderNotes).paymentProofImageUrl ||
        "";

      if (!proofUrl) {
        setPaymentProofPreviewUrl("");
        return;
      }

      if (/^https?:\/\//i.test(proofUrl) || proofUrl.startsWith("data:image/")) {
        setPaymentProofPreviewUrl(getImageUrl(proofUrl));
        return;
      }

      try {
        const requestUrl = proofUrl.startsWith("/api/")
          ? proofUrl.replace(/^\/api/, "")
          : proofUrl;
        const blobResponse = await ecommerceService.get(requestUrl, {
          responseType: "blob",
        });
        objectUrlToRevoke = URL.createObjectURL(blobResponse.data);
        setPaymentProofPreviewUrl(objectUrlToRevoke);
      } catch (error) {
        console.error("Payment proof preview error:", error);
        setPaymentProofPreviewUrl("");
      }
    };

    loadPaymentProofPreview();

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [order?.id, order?.orderNotes, order?.paymentProofImageUrl]);

  if (!order) return null;

  const total = order.total || order.totalAmount || 0;
  const hasDiscounts = Number(order.total_discount_amount || 0) > 0;
  const storefrontDetails = parseStorefrontOrderNotes(order.orderNotes);
  const senderName =
    storefrontDetails.senderName ||
    `${order.customerName} ${order.customerLastName}`.trim();
  const senderEmail = storefrontDetails.senderEmail || order.customerEmail;
  const senderPhone = storefrontDetails.senderPhone || order.customerPhone;
  const receiverName =
    storefrontDetails.receiverName || order.billingContactName;
  const receiverPhone = storefrontDetails.receiverPhone;
  const exactAddress =
    storefrontDetails.exactAddress || order.billingPrincipalAddress;
  const deliveryDateTime = storefrontDetails.deliveryDateTime;
  const cardMessage = storefrontDetails.cardMessage || order.deliveryNotes;
  const observations =
    storefrontDetails.observations || order.customerReference;
  const paymentMethod =
    storefrontDetails.paymentMethod ||
    (order.clientTransactionId ? "Payphone" : null);
  const hasNotes = order.description || order.notes;
  const showsPaymentProofActions =
    paymentMethod === "Banco" || paymentMethod === "Zelle";
  const paymentProofImageUrl =
    order.paymentProofImageUrl || storefrontDetails.paymentProofImageUrl || "";
  const paymentProofFileName =
    order.paymentProofFileName || storefrontDetails.paymentProofFileName || "";
  const hasPaymentProof = Boolean(paymentProofImageUrl);
  const resolvedPaymentProofPreviewUrl =
    paymentProofPreviewUrl ||
    (paymentProofImageUrl ? getImageUrl(paymentProofImageUrl) : "");

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-x-hidden overflow-y-auto p-0">
          <div className="rounded-t-lg bg-linear-to-r from-gray-900 to-gray-700 px-6 py-5 text-white">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Pedido #{order.orderNumber}
                  </DialogTitle>
                  <p className="mt-0.5 text-sm text-gray-300">
                    {new LocalDate(order.createdAt).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge
                    className={`px-3 py-1 text-sm ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`border px-2 py-0.5 text-xs ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {getPaymentStatusText(order.paymentStatus)}
                    {order.paidAt && (
                      <span className="ml-1 opacity-70">
                        · {new LocalDate(order.paidAt).toLocaleDateString()}
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-5 overflow-x-hidden p-6">
            {((order.status !== "DELIVERED" && order.status !== "CANCELLED") ||
              (order.paymentStatus !== "PAID" && !order.clientTransactionId)) && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <span className="text-sm font-medium text-blue-800">
                  Acciones:
                </span>

                {order.status !== "DELIVERED" &&
                  order.status !== "CANCELLED" && (
                    <Select
                      onValueChange={(value) => onChangeStatus(order.id, value)}
                    >
                      <SelectTrigger className="h-8 w-44 bg-white text-sm">
                        <SelectValue placeholder="Cambiar estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Cambiar a:</SelectLabel>
                          {statusOptions
                            .filter(
                              (option) =>
                                option.value !== "ALL" &&
                                option.value !== order.status
                            )
                            .map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}

                {order.paymentStatus !== "PAID" && !order.clientTransactionId && (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-green-600 text-white hover:bg-green-700"
                    onClick={() => onUpdatePaymentStatus(order.id, "PAID")}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Confirmar pago
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0 space-y-2 rounded-lg bg-gray-50 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Quien envia
                </h3>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {senderName || "No especificado"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {senderEmail && (
                    <InfoRow
                      icon={<Mail className="h-4 w-4" />}
                      value={senderEmail}
                    />
                  )}
                  {senderPhone && (
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      value={senderPhone}
                    />
                  )}
                </div>
              </div>

              <div className="min-w-0 space-y-2 rounded-lg bg-gray-50 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Quien recibe
                </h3>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <Truck className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {receiverName || "No especificado"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {receiverPhone && (
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      value={receiverPhone}
                    />
                  )}
                  {(order.customerProvince || order.billingCity) && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      value={[order.customerProvince, order.billingCity]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  )}
                  {exactAddress && (
                    <InfoRow
                      icon={<Home className="h-4 w-4" />}
                      value={exactAddress}
                    />
                  )}
                  {order.billingSecondAddress && (
                    <InfoRow
                      icon={<Home className="h-4 w-4 opacity-40" />}
                      value={order.billingSecondAddress}
                    />
                  )}
                  {deliveryDateTime && (
                    <InfoRow
                      icon={<Clock className="h-4 w-4" />}
                      value={deliveryDateTime}
                    />
                  )}
                  {cardMessage && (
                    <InfoRow
                      icon={<MessageSquare className="h-4 w-4" />}
                      value={cardMessage}
                    />
                  )}
                  {observations && (
                    <InfoRow
                      icon={<FileText className="h-4 w-4" />}
                      value={observations}
                    />
                  )}
                  {paymentMethod && (
                    <InfoRow
                      icon={<CreditCard className="h-4 w-4" />}
                      value={paymentMethod}
                    />
                  )}
                  {order.Courier && (
                    <InfoRow
                      icon={<Truck className="h-4 w-4" />}
                      value={order.Courier}
                    />
                  )}
                </div>
              </div>
            </div>

            {showsPaymentProofActions && (
              <div className="min-w-0 space-y-4 rounded-xl border bg-white p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <Image className="h-4 w-4" />
                      Comprobante de pago
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Metodo: <span className="font-medium">{paymentMethod}</span>
                    </p>
                  </div>
                  <Select
                    value={paymentProofStatusValue}
                    onValueChange={setPaymentProofStatusValue}
                  >
                    <SelectTrigger className="h-10 w-40 bg-white text-sm">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="VERIFIED">Revisado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasPaymentProof ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      El comprobante fue subido correctamente.
                    </div>
                    <a
                      href={resolvedPaymentProofPreviewUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block max-w-full overflow-hidden rounded-xl border bg-gray-50"
                    >
                      <div className="relative h-72 w-full overflow-hidden bg-white">
                        <img
                          src={resolvedPaymentProofPreviewUrl}
                          alt={paymentProofFileName || "Comprobante"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    El cliente aun no ha subido un comprobante o esta orden no
                    tiene una URL guardada todavia.
                  </div>
                )}

                {order.paymentProofUploadedAt && (
                  <p className="text-xs text-gray-500">
                    Subido{" "}
                    {new LocalDate(
                      order.paymentProofUploadedAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {!showsPaymentProofActions && hasPaymentProof && (
              <div className="space-y-4 rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <Image className="h-4 w-4" />
                      Comprobante de pago
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Estado:{" "}
                      <span className="font-medium">
                        {paymentProofStatusValue === "VERIFIED"
                          ? "Revisado"
                          : "Pendiente"}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProofDialogOpen(true)}
                  >
                    Ver comprobante
                  </Button>
                </div>
              </div>
            )}

            {order.clientTransactionId && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>Pago con tarjeta (PayPhone)</span>
                {order.payPhoneAuthCode && (
                  <span className="ml-auto font-mono text-xs text-blue-500">
                    Auth: {order.payPhoneAuthCode}
                  </span>
                )}
              </div>
            )}

            {hasNotes && (
              <div className="space-y-2 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                  <MessageSquare className="h-4 w-4" />
                  Notas
                </h3>
                {order.description && (
                  <p className="text-sm text-yellow-900">{order.description}</p>
                )}
                {order.notes && (
                  <p className="text-sm text-yellow-900">{order.notes}</p>
                )}
                {order.orderNotes && order.orderNotes !== order.notes && (
                  <p className="text-sm text-yellow-900">{order.orderNotes}</p>
                )}
                {order.deliveryNotes && (
                  <p className="text-sm text-yellow-900">
                    <span className="font-medium">Entrega: </span>
                    {order.deliveryNotes}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <Package className="h-4 w-4" />
                Productos ({order.orderItems.length})
              </h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">
                          {item.product.name}
                        </span>
                        {item.variantName && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-blue-200 bg-blue-50 text-xs text-blue-700"
                          >
                            {item.variantName}
                          </Badge>
                        )}
                        {item.discounts_percents && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-orange-200 bg-orange-50 text-xs text-orange-700"
                          >
                            -{item.discounts_percents}%
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-green-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-gray-50">
              <div className="space-y-2 px-4 py-3 text-sm">
                {hasDiscounts && (
                  <>
                    <FinRow
                      label="Precio sin descuentos"
                      value={`$${(
                        order.subtotal +
                        Number(order.total_discount_amount || 0)
                      ).toFixed(2)}`}
                      muted
                    />
                    {Number(order.product_discounted_amount || 0) > 0 && (
                      <FinRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Badge className="bg-green-600 px-1.5 text-xs text-white">
                              Promocion
                            </Badge>
                          </span>
                        }
                        value={`-$${Number(
                          order.product_discounted_amount
                        ).toFixed(2)}`}
                        accent="green"
                      />
                    )}
                    {Number(order.coupon_discounted_amount || 0) > 0 && (
                      <FinRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Badge className="bg-purple-600 px-1.5 text-xs text-white">
                              Cupon
                            </Badge>
                            <span className="text-gray-600">
                              {order.couponDiscountCode}
                            </span>
                          </span>
                        }
                        value={`-$${Number(
                          order.coupon_discounted_amount
                        ).toFixed(2)}`}
                        accent="purple"
                      />
                    )}
                    {Number(order.code_discounted_amount || 0) > 0 && (
                      <FinRow
                        label={
                          <span className="flex items-center gap-1.5">
                            <Badge className="bg-blue-600 px-1.5 text-xs text-white">
                              Codigo
                            </Badge>
                          </span>
                        }
                        value={`-$${Number(order.code_discounted_amount).toFixed(
                          2
                        )}`}
                        accent="blue"
                      />
                    )}
                    <div className="mt-1 border-t border-dashed border-gray-200 pt-2" />
                  </>
                )}

                <FinRow
                  label="Subtotal"
                  value={`$${order.subtotal.toFixed(2)}`}
                />
                <FinRow label="IVA (15%)" value={`$${order.tax.toFixed(2)}`} />
                {Number(order.shipping || 0) > 0 && (
                  <FinRow
                    label="Reserva (envio)"
                    value={`$${Number(order.shipping).toFixed(2)}`}
                  />
                )}
              </div>

              <div className="flex items-center justify-between bg-gray-900 px-4 py-4 text-white">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-bold text-green-400">
                  ${total.toFixed(2)}
                </span>
              </div>

              {order.cashOnDelivery && (
                <div className="space-y-1 border-t-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-800">
                      Reserva pagada online
                    </span>
                    <span className="font-semibold text-amber-900">$7.00</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-900">Pendiente al recibir</span>
                    <span className="text-base text-amber-900">
                      ${(total - 7).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
          <div className="border-b bg-white px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Comprobante de pago
              </DialogTitle>
            </DialogHeader>
            <p className="mt-1 text-sm text-gray-500">
              Pedido #{order.orderNumber}
            </p>
          </div>
          <div className="space-y-4 bg-gray-50 p-6">
            {hasPaymentProof ? (
              <>
                <a
                  href={resolvedPaymentProofPreviewUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl border bg-white"
                >
                  <div className="relative h-[70vh] w-full overflow-hidden bg-white">
                    <img
                      src={resolvedPaymentProofPreviewUrl}
                      alt={paymentProofFileName || "Comprobante"}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </a>
              </>
            ) : (
              <div className="rounded-xl border border-dashed bg-white px-4 py-16 text-center text-sm text-gray-500">
                Esta orden no tiene comprobante disponible para mostrar.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <span className="break-words leading-snug text-gray-700">{value}</span>
    </div>
  );
}

function FinRow({
  label,
  value,
  muted,
  accent,
}: {
  label: React.ReactNode;
  value: string;
  muted?: boolean;
  accent?: "green" | "purple" | "blue";
}) {
  const valueColor =
    accent === "green"
      ? "text-green-700 font-semibold"
      : accent === "purple"
      ? "text-purple-700 font-semibold"
      : accent === "blue"
      ? "text-blue-700 font-semibold"
      : muted
      ? "text-gray-400 line-through"
      : "text-gray-800";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-gray-400" : "text-gray-600"}>
        {label}
      </span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
