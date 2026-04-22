import { useState, useCallback, useRef } from "react";
import type { Order } from "../types";
import { toast } from "sonner";
import ordersService from "../api/orders-service";
import { useOrdersStore } from "../store/order-store";
import { LocalDate } from "@/core/utils/date";

export default function useOrder() {
  const { orders, setOrders, updateOrderStatusState } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rangeDateFilter, setRangeDateFilter] = useState("today");
  const [dateFilterStart, setDateFilterStart] = useState<LocalDate | undefined>(undefined);
  const [dateFilterEnd, setDateFilterEnd] = useState<LocalDate | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fecthOrderWithParams = useCallback(async (params: URLSearchParams) => {
    try {
      setIsLoading(true);
      const response = await ordersService.get_all_orders(params);
      if (response.status === "success" && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Error de conexión al cargar pedidos");
    } finally {
      setIsLoading(false);
    }
  }, [setOrders]);

  const fetchWithCurrentFilters = useCallback(async (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    const status = overrides?.status ?? statusFilter;
    const range = overrides?.range ?? rangeDateFilter;
    const q = overrides?.search ?? search;

    if (status && status !== "ALL") params.append("status", status);
    if (range) params.append("range", range);
    if (q) params.append("search", q);

    await fecthOrderWithParams(params);
  }, [statusFilter, rangeDateFilter, search, fecthOrderWithParams]);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    const params = new URLSearchParams();
    if (value && value !== "ALL") params.append("status", value);
    if (rangeDateFilter) params.append("range", rangeDateFilter);
    if (search) params.append("search", search);
    fecthOrderWithParams(params);
  }, [rangeDateFilter, search, fecthOrderWithParams]);

  const handleRangeFilterChange = useCallback((value: string) => {
    setRangeDateFilter(value);
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
    if (value) params.append("range", value);
    if (search) params.append("search", search);
    fecthOrderWithParams(params);
  }, [statusFilter, search, fecthOrderWithParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
      if (rangeDateFilter) params.append("range", rangeDateFilter);
      if (value) params.append("search", value);
      fecthOrderWithParams(params);
    }, 350);
  }, [statusFilter, rangeDateFilter, fecthOrderWithParams]);

  const openOrder = useCallback(async (orderSummary: Order) => {
    setSelectedOrder(orderSummary);

    try {
      const response = await ordersService.get_order(orderSummary.id);
      const fullOrder = response?.data;
      if (response?.status === "success" && fullOrder) {
        setSelectedOrder(fullOrder);
        setOrders(
          orders.map((order) =>
            order.id === fullOrder.id ? { ...order, ...fullOrder } : order
          )
        );
      }
    } catch (error) {
      console.error("Fetch order detail error:", error);
      toast.error("No se pudo cargar el detalle completo del pedido");
    }
  }, [orders, setOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await ordersService.update_order_status(orderId, { status: newStatus });
      if (response.status === "success") {
        updateOrderStatusState(orderId, newStatus);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        toast.success("Estado actualizado");
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Error de conexión");
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const response = await ordersService.update_payment_status(orderId, paymentStatus);
      if (response.status === "success") {
        // Actualizar la orden en el store y en el detalle abierto
        setOrders(orders.map((o) =>
          o.id === orderId
            ? { ...o, paymentStatus, paidAt: paymentStatus === "PAID" ? new Date().toISOString() : o.paidAt }
            : o
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus, paidAt: paymentStatus === "PAID" ? new Date().toISOString() : selectedOrder.paidAt });
        }
        toast.success(paymentStatus === "PAID" ? "Pago confirmado" : "Estado de pago actualizado");
      } else {
        toast.error("Error al actualizar estado de pago");
      }
    } catch (error) {
      console.error("Update payment status error:", error);
      toast.error("Error de conexión");
    }
  };

  const updatePaymentProof = async (
    orderId: string,
    paymentProofStatus: string,
    paymentVerificationNotes?: string,
  ) => {
    try {
      const response = await ordersService.update_payment_proof(
        orderId,
        paymentProofStatus,
        paymentVerificationNotes,
      );
      if (response.status === "success") {
        setOrders(orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                paymentProofStatus,
                paymentVerificationNotes: paymentVerificationNotes || null,
                paymentVerifiedAt: paymentProofStatus === "VERIFIED" ? new Date().toISOString() : null,
              }
            : o
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            paymentProofStatus,
            paymentVerificationNotes: paymentVerificationNotes || null,
            paymentVerifiedAt: paymentProofStatus === "VERIFIED" ? new Date().toISOString() : null,
          });
        }
        toast.success("Comprobante actualizado");
      } else {
        toast.error("No se pudo actualizar el comprobante");
      }
    } catch (error) {
      console.error("Update payment proof error:", error);
      toast.error("Error de conexión");
    }
  };

  const bulkUpdateStatus = async (orderIds: string[], newStatus: string) => {
    try {
      const response = await ordersService.bulk_update_status(orderIds, newStatus);
      if (response.status === "success") {
        orderIds.forEach((id) => updateOrderStatusState(id, newStatus));
        toast.success(`${response.count} pedidos actualizados`);
        return true;
      } else {
        toast.error("Error en la actualización masiva");
        return false;
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Error de conexión");
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":    return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":  return "bg-blue-100 text-blue-800";
      case "PREPARING":  return "bg-orange-100 text-orange-800";
      case "READY":      return "bg-green-100 text-green-800";
      case "DELIVERED":  return "bg-gray-100 text-gray-800";
      case "CANCELLED":  return "bg-red-100 text-red-800";
      default:           return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":    return "Pendiente";
      case "CONFIRMED":  return "Confirmado";
      case "PREPARING":  return "Preparando";
      case "READY":      return "Listo";
      case "DELIVERED":  return "Entregado";
      case "CANCELLED":  return "Cancelado";
      default:           return status;
    }
  };

  const getPaymentStatusColor = (ps: string) => {
    switch (ps) {
      case "PAID":       return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":    return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "FAILED":     return "bg-red-100 text-red-800 border-red-300";
      case "CANCELLED":  return "bg-gray-100 text-gray-600 border-gray-300";
      default:           return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getPaymentStatusText = (ps: string) => {
    switch (ps) {
      case "PAID":       return "Pagado";
      case "PENDING":    return "Pago pendiente";
      case "FAILED":     return "Pago fallido";
      case "CANCELLED":  return "Cancelado";
      default:           return ps || "Pendiente";
    }
  };

  const statusOptions = [
    { value: "ALL",       label: "Todos los estados" },
    { value: "PENDING",   label: "Pendiente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PREPARING", label: "Preparando" },
    { value: "READY",     label: "Listo" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  return {
    orders,
    isLoading,
    search,
    setSearch: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    rangeDateFilter,
    setRangeDateFilter: handleRangeFilterChange,
    dateFilterStart,
    setDateFilterStart,
    dateFilterEnd,
    setDateFilterEnd,
    selectedOrder,
    setSelectedOrder,
    openOrder,
    fecthOrderWithParams,
    fetchWithCurrentFilters,
    updateOrderStatus,
    updatePaymentStatus,
    updatePaymentProof,
    bulkUpdateStatus,
    getStatusColor,
    getStatusText,
    getPaymentStatusColor,
    getPaymentStatusText,
    statusOptions,
  };
}
