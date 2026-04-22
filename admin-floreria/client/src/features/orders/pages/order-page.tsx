import { useState, useCallback, useEffect, useRef } from "react";
import type { Order } from "../types";
import { Button } from "@/shared/components/ui/button";
import Loading from "@/shared/components/loading";
import useOrder from "../hooks/use-order";
import { OrdersFilters } from "../components/orders-filters";
import { OrdersBulkActions } from "../components/orders-bulk-actions";
import { OrdersTable } from "../components/orders-table";
import { OrderDetailsDialog } from "../components/order-details-dialog";

const AUTO_REFRESH_MS = 60_000;

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    rangeDateFilter,
    setRangeDateFilter,
    dateFilterStart,
    setDateFilterStart,
    dateFilterEnd,
    setDateFilterEnd,
    selectedOrder,
    setSelectedOrder,
    openOrder,
    updateOrderStatus,
    updatePaymentStatus,
    bulkUpdateStatus,
    getStatusColor,
    getStatusText,
    getPaymentStatusColor,
    getPaymentStatusText,
    statusOptions,
    fecthOrderWithParams,
    fetchWithCurrentFilters,
  } = useOrder();

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const hasLoadedOnce = useRef(false);

  // Carga inicial — hoy
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("range", "today");
    fecthOrderWithParams(params).then(() => {
      hasLoadedOnce.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh cada 60s
  useEffect(() => {
    const id = setInterval(() => {
      fetchWithCurrentFilters();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchWithCurrentFilters]);

  const clearSelection = useCallback(() => setSelectedOrders([]), []);

  const toggleOrderSelection = useCallback(
    (id: string) =>
      setSelectedOrders((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      ),
    []
  );

  const handleAdvancedApply = async () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
    if (rangeDateFilter) params.append("range", rangeDateFilter);
    if (search) params.append("search", search);
    if (dateFilterStart && dateFilterEnd) {
      params.append("dateStart", dateFilterStart.toLocalISODateString().slice(0, 10));
      params.append("dateEnd", dateFilterEnd.toLocalISODateString().slice(0, 10));
    }
    await fecthOrderWithParams(params);
  };

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("ALL");
    setRangeDateFilter("today");
    setDateFilterStart(undefined);
    setDateFilterEnd(undefined);
    setMinAmount("");
    setMaxAmount("");
    setShowAdvancedFilters(false);
    const params = new URLSearchParams();
    params.append("range", "today");
    fecthOrderWithParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMultipleOrderStatus = useCallback(
    async (newStatus: string) => {
      const success = await bulkUpdateStatus(selectedOrders, newStatus);
      if (success) clearSelection();
    },
    [selectedOrders, bulkUpdateStatus, clearSelection]
  );

  const handleMarkAsPaid = useCallback(
    (orderId: string) => updatePaymentStatus(orderId, "PAID"),
    [updatePaymentStatus]
  );

  const hasAdvancedActive = !!(dateFilterStart || dateFilterEnd || minAmount || maxAmount);

  // Mostrar spinner de pantalla completa solo en la carga inicial (sin datos aún)
  if (isLoading && !hasLoadedOnce.current) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
            {isLoading && hasLoadedOnce.current && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                actualizando
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} cargados
          </p>
        </header>

        <OrdersFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          rangeDateFilter={rangeDateFilter}
          setRangeDateFilter={setRangeDateFilter}
          dateFilterStart={dateFilterStart}
          setDateFilterStart={setDateFilterStart}
          dateFilterEnd={dateFilterEnd}
          setDateFilterEnd={setDateFilterEnd}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          minAmount={minAmount}
          maxAmount={maxAmount}
          setMinAmount={setMinAmount}
          setMaxAmount={setMaxAmount}
          onAdvancedApply={handleAdvancedApply}
          onClearAll={clearAllFilters}
          datePickerOpen={datePickerOpen}
          setDatePickerOpen={setDatePickerOpen}
          hasAdvancedActive={hasAdvancedActive}
        />

        <OrdersBulkActions
          count={selectedOrders.length}
          onClear={clearSelection}
          statusOptions={statusOptions}
          onUpdateMany={updateMultipleOrderStatus}
          onExport={() => {/* TODO export */}}
        />

        <section className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Pedidos</h2>
            <span className="text-sm text-gray-400">{orders.length} resultados</span>
          </div>
          <div className="p-6">
            <OrdersTable
              items={orders}
              selectedIds={selectedOrders}
              onToggleSelect={toggleOrderSelection}
              onTogglePage={(ids) => setSelectedOrders(ids)}
              allPageSelected={
                selectedOrders.length > 0 &&
                selectedOrders.length === orders.length &&
                orders.length > 0
              }
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getPaymentStatusColor={getPaymentStatusColor}
              getPaymentStatusText={getPaymentStatusText}
              onOpen={openOrder}
              onChangeStatus={updateOrderStatus}
              onMarkAsPaid={handleMarkAsPaid}
              statusOptions={statusOptions}
              isLoading={isLoading && hasLoadedOnce.current}
            />
          </div>
          {orders.length === 0 && !isLoading && <EmptyNoData onReset={clearAllFilters} />}
        </section>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getPaymentStatusColor={getPaymentStatusColor}
        getPaymentStatusText={getPaymentStatusText}
        onUpdatePaymentStatus={updatePaymentStatus}
        onChangeStatus={updateOrderStatus}
        statusOptions={statusOptions}
      />
    </div>
  );
}

function EmptyNoData({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-lg font-medium text-gray-900 mb-2">No hay pedidos con estos filtros</p>
      <p className="text-gray-500 mb-4">Ajusta el rango de fechas o limpia los filtros</p>
      <Button variant="outline" onClick={onReset}>Limpiar filtros</Button>
    </div>
  );
}
