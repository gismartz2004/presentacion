import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ecommerceService from "@/core/api/ecommerce-service";
import { Button } from "@/shared/components/ui/button";

type AbandonedCartStatus = "NEW" | "CONTACTED" | "RECOVERED" | "CLOSED";

type AbandonedCart = {
  id: string;
  customerName: string;
  customerPhone: string;
  senderName?: string | null;
  receiverName?: string | null;
  exactAddress?: string | null;
  sector?: string | null;
  paymentMethod?: string | null;
  deliveryDateTime?: string | null;
  cardMessage?: string | null;
  couponCode?: string | null;
  total: number;
  items: Array<{ name: string; quantity: number; price: number | string }>;
  source?: string | null;
  emailSent: boolean;
  ownerEmail?: string | null;
  status: AbandonedCartStatus;
  notes?: string | null;
  contactedAt?: string | null;
  recoveredAt?: string | null;
  recoveredOrder?: {
    id: string;
    orderNumber: string;
    total: number;
    paymentStatus?: string | null;
    status?: string | null;
    createdAt: string;
  } | null;
  abandonedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS: Array<{ value: "ALL" | AbandonedCartStatus; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "NEW", label: "Nuevos" },
  { value: "CONTACTED", label: "Contactados" },
  { value: "RECOVERED", label: "Recuperados" },
  { value: "CLOSED", label: "Cerrados" },
];

function extractCustomerEmail(notes?: string | null) {
  if (!notes) return "";

  const match = notes.match(/Correo\s+envia:\s*([^|]+)/i);
  return match?.[1]?.trim() || "";
}

export default function AbandonedCartsPage() {
  const [items, setItems] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | AbandonedCartStatus>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedCart = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId]
  );

  const loadCarts = async (overrides?: { search?: string; status?: string }) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      const resolvedSearch = overrides?.search ?? search;
      const resolvedStatus = overrides?.status ?? status;

      if (resolvedSearch.trim()) params.append("search", resolvedSearch.trim());
      if (resolvedStatus && resolvedStatus !== "ALL") params.append("status", resolvedStatus);

      const query = params.toString();
      const response = await ecommerceService.get(
        query ? `/abandoned-carts?${query}` : "/abandoned-carts"
      );
      const data = response.data?.data || [];
      setItems(data);
      setSelectedId((current) =>
        current && data.some((item: AbandonedCart) => item.id === current)
          ? current
          : data[0]?.id || null
      );
    } catch (error) {
      console.error("Load abandoned carts error:", error);
      toast.error("No se pudieron cargar los carritos abandonados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, []);

  useEffect(() => {
    setNotes(selectedCart?.notes || "");
  }, [selectedCart?.id, selectedCart?.notes]);

  const applyFilters = async () => {
    await loadCarts();
  };

  const updateStatus = async (nextStatus: AbandonedCartStatus) => {
    if (!selectedCart) return;

    try {
      setIsSaving(true);
      const response = await ecommerceService.patch(`/abandoned-carts/${selectedCart.id}`, {
        status: nextStatus,
        notes,
      });

      const updated = response.data?.data;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Seguimiento actualizado");
    } catch (error) {
      console.error("Update abandoned cart error:", error);
      toast.error("No se pudo actualizar el carrito abandonado");
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedCart) return;

    try {
      setIsSaving(true);
      const response = await ecommerceService.patch(`/abandoned-carts/${selectedCart.id}`, {
        notes,
      });

      const updated = response.data?.data;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Notas guardadas");
    } catch (error) {
      console.error("Save abandoned cart notes error:", error);
      toast.error("No se pudieron guardar las notas");
    } finally {
      setIsSaving(false);
    }
  };

  const customerEmail = extractCustomerEmail(selectedCart?.notes);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Carritos Abandonados</h1>
        <p className="mt-1 text-gray-600">
          Revisa abandonos, marca seguimiento comercial y registra cuales se recuperaron.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, telefono o direccion"
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ALL" | AbandonedCartStatus)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button onClick={applyFilters} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Filtrar"}
          </Button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Listado</h2>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            {isLoading ? (
              <div className="p-6 text-sm text-gray-500">Cargando carritos abandonados...</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No hay resultados con esos filtros.</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
                    selectedCart?.id === item.id ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.customerName}</p>
                      <p className="text-xs text-gray-500">{item.customerPhone}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{formatDate(item.abandonedAt || item.createdAt)}</span>
                    <span>${Number(item.total || 0).toFixed(2)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-gray-900">Detalle</h2>
          </div>

          {!selectedCart ? (
            <div className="p-6 text-sm text-gray-500">Selecciona un carrito para ver el detalle.</div>
          ) : (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={selectedCart.status} />
                <span className="text-sm text-gray-500">
                  Abandonado: {formatDate(selectedCart.abandonedAt || selectedCart.createdAt)}
                </span>
                {selectedCart.emailSent && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700">
                    Email enviado
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    selectedCart.recoveredOrder
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedCart.recoveredOrder ? "Compro despues" : "Sin compra posterior"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Info label="Cliente" value={selectedCart.customerName} />
                <Info label="Telefono" value={selectedCart.customerPhone} />
                <Info label="Email cliente" value={customerEmail} />
                <Info label="Quien envia" value={selectedCart.senderName} />
                <Info label="Quien recibe" value={selectedCart.receiverName} />
                <Info label="Direccion" value={selectedCart.exactAddress} />
                <Info label="Sector" value={selectedCart.sector} />
                <Info label="Pago" value={selectedCart.paymentMethod} />
                <Info label="Entrega" value={selectedCart.deliveryDateTime} />
                <Info label="Cupon" value={selectedCart.couponCode} />
                <Info label="Origen" value={selectedCart.source} />
                <Info label="Total" value={`$${Number(selectedCart.total || 0).toFixed(2)}`} />
                <Info
                  label="Compro despues"
                  value={selectedCart.recoveredOrder ? "Si" : "No"}
                />
                <Info
                  label="Orden posterior"
                  value={selectedCart.recoveredOrder?.orderNumber}
                />
                <Info
                  label="Fecha compra"
                  value={selectedCart.recoveredOrder?.createdAt ? formatDate(selectedCart.recoveredOrder.createdAt) : ""}
                />
              </div>

              {selectedCart.cardMessage && (
                <CompactBlock label="Mensaje de tarjeta">
                  {selectedCart.cardMessage}
                </CompactBlock>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Productos</p>
                <div className="space-y-1.5 rounded-lg border bg-gray-50 p-3">
                  {(selectedCart.items || []).map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-gray-700">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Notas internas</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Seguimiento, respuesta del cliente, observaciones..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={saveNotes} disabled={isSaving}>
                  Guardar notas
                </Button>
                <Button variant="outline" onClick={() => updateStatus("CONTACTED")} disabled={isSaving}>
                  Marcar contactado
                </Button>
                <Button onClick={() => updateStatus("RECOVERED")} disabled={isSaving}>
                  Marcar recuperado
                </Button>
                <Button variant="outline" onClick={() => updateStatus("CLOSED")} disabled={isSaving}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm leading-snug text-gray-900 break-words">{value?.trim() ? value : "-"}</p>
    </div>
  );
}

function CompactBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AbandonedCartStatus }) {
  const styles: Record<AbandonedCartStatus, string> = {
    NEW: "bg-yellow-100 text-yellow-800",
    CONTACTED: "bg-blue-100 text-blue-800",
    RECOVERED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  const labels: Record<AbandonedCartStatus, string> = {
    NEW: "Nuevo",
    CONTACTED: "Contactado",
    RECOVERED: "Recuperado",
    CLOSED: "Cerrado",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
