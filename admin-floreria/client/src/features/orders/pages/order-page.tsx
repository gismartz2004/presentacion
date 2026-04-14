import { useState, useMemo, useCallback, useEffect } from "react";
import type { Order } from "../types";
import { Button } from "@/shared/components/ui/button";
import Loading from "@/shared/components/loading";
import useOrder from "../hooks/use-order";
import { OrdersFilters } from "../components/orders-filters";
import { OrdersBulkActions } from "../components/orders-bulk-actions";
import { OrdersTable } from "../components/orders-table";
import { OrderDetailsDialog } from "../components/order-details-dialog";

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
    updateOrderStatus,
    bulkUpdateStatus,
    getStatusColor,
    getStatusText,
    statusOptions,
    fecthOrderWithParams,
  } = useOrder();

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const clearSelection = useCallback(() => setSelectedOrders([]), []);

  const toggleOrderSelection = useCallback(
    (id: string) =>
      setSelectedOrders((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      ),
    []
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (
        search &&
        !o.customerName?.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [orders, search]);

  const handleAdvancedApply = async () => {
    console.log("Applying advanced filters:", {
      dateFilterStart,
      dateFilterEnd,
      minAmount,
      maxAmount,
    });

    const params = new URLSearchParams();
    if (dateFilterStart && dateFilterEnd) {
      params.append(
        "dateStart",
        dateFilterStart.toLocalISODateString().slice(0, 10)
      );
      params.append(
        "dateEnd",
        dateFilterEnd.toLocalISODateString().slice(0, 10)
      );
    }
    if (minAmount && maxAmount) {
      params.append("minAmount", minAmount);
      params.append("maxAmount", maxAmount);
    }

    await fecthOrderWithParams(params);
  };

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("ALL");
    setRangeDateFilter("");
    setDateFilterStart(undefined);
    setDateFilterEnd(undefined);
    setMinAmount("");
    setMaxAmount("");
    setShowAdvancedFilters(false);
  }, [
    setSearch,
    setStatusFilter,
    setRangeDateFilter,
    setDateFilterStart,
    setDateFilterEnd,
    setMinAmount,
    setMaxAmount,
    setShowAdvancedFilters,
  ]);

  const updateMultipleOrderStatus = useCallback(
    async (newStatus: string) => {
      const success = await bulkUpdateStatus(selectedOrders, newStatus);
      if (success) {
        clearSelection();
      }
    },
    [selectedOrders, bulkUpdateStatus, clearSelection]
  );

  const hasAdvancedActive = !!(
    dateFilterStart ||
    dateFilterEnd ||
    minAmount ||
    maxAmount
  );

  const onTogglePage = useCallback((ids: string[]) => {
    setSelectedOrders(ids);
  }, []);

  // Efecto para aplicar filtros automáticamente cuando cambia el status
  useEffect(() => {
    console.log("Status or range filter changed:", { statusFilter, rangeDateFilter });

    const searchForChange = async () => {
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      if (rangeDateFilter) params.append("range", rangeDateFilter);

      await fecthOrderWithParams(params);
    };

    searchForChange();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, rangeDateFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra eficientemente todos los pedidos
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
          onExport={() => {
            /* TODO export */
          }}
        />

        <section className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Pedidos
            </h2>
          </div>
          <div className="p-6">
            <OrdersTable
              items={filteredOrders}
              selectedIds={selectedOrders}
              onToggleSelect={toggleOrderSelection}
              onTogglePage={onTogglePage}
              allPageSelected={
                selectedOrders.length > 0 &&
                selectedOrders.length === filteredOrders.length &&
                filteredOrders.length > 0
              }
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              onOpen={(o: Order) => setSelectedOrder(o)}
              onChangeStatus={updateOrderStatus}
              statusOptions={statusOptions}
            />
          </div>
          {filteredOrders.length === 0 && orders.length > 0 && (
            <EmptyFiltered onReset={clearAllFilters} />
          )}
          {orders.length === 0 && <EmptyNoData />}
        </section>
      </div>
      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />
    </div>
  );
}

function EmptyFiltered({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron pedidos con estos filtros
      </p>
      <p className="text-gray-500 mb-4">
        Ajusta los criterios de búsqueda o limpia los filtros
      </p>
      <Button variant="outline" onClick={onReset}>
        Limpiar filtros
      </Button>
    </div>
  );
}

function EmptyNoData() {
  return (
    <div className="text-center py-16">
      <p className="text-lg font-medium text-gray-900 mb-2">
        No hay pedidos todavía
      </p>
      <p className="text-gray-500">
        Los pedidos aparecerán aquí cuando se generen
      </p>
    </div>
  );
}
