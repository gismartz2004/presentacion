import { useState } from "react";
import type { Order } from "../types";
import { toast } from "sonner";
import ordersService from "../api/orders-service";
import { useOrdersStore } from "../store/order-store";
import { LocalDate } from "@/core/utils/date";

export default function useOrder() {
  // Estado refactorizado
  const { orders, setOrders, updateOrderStatusState } = useOrdersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rangeDateFilter, setRangeDateFilter] = useState("today");
  const [dateFilterStart, setDateFilterStart] = useState<LocalDate | undefined>(
    undefined
  );
  const [dateFilterEnd, setDateFilterEnd] = useState<LocalDate | undefined>(
    undefined
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    // try {
    //   const params = new URLSearchParams();
    //   // Carga inicial solo por día actual
    //   const day = new LocalDate().toLocalISODateString().slice(0, 10); // YYYY-MM-DD
    //   params.append("day", day);
    //   const response = await ordersService.get_all_orders(params);
    //   if (response.status === "success" && response.data) {
    //     const fetched = response.data || [];
    //     setOrders(fetched);
    //   }
    // } catch (error) {
    //   console.error("Fetch orders error:", error);
    //   toast.error("Error de conexión");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const fecthOrderWithParams = async (params: URLSearchParams) => {
    console.log("Fetching orders with params:", params.toString());
    try {
      setIsLoading(true);
      const response = await ordersService.get_all_orders(params);
      
      // Nuevo formato de respuesta del ecommerce-be: { success: true, data: [...], pagination: {...} }
      if (response.success && response.data) {
        const fetched = response.data || [];
        setOrders(fetched);
        console.log("Orders loaded:", fetched.length, "Total:", response.pagination?.total);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };



  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await ordersService.update_order_status(orderId, {
        status: newStatus,
      });

      // Nuevo formato de respuesta: { success: true, data: {...} }
      if (response.success) {
        updateOrderStatusState(orderId, newStatus);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        toast.success("Estado actualizado correctamente");
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Error de conexión al actualizar estado");
    }
  };

  const bulkUpdateStatus = async (orderIds: string[], newStatus: string) => {
    try {
      const response = await ordersService.bulk_update_status(orderIds, newStatus);
      
      if (response.success) {
        // Actualizar múltiples órdenes en el estado
        orderIds.forEach(orderId => {
          updateOrderStatusState(orderId, newStatus);
        });
        toast.success(`${response.count} órdenes actualizadas correctamente`);
        return true;
      } else {
        toast.error("Error en la actualización masiva");
        return false;
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Error de conexión en la actualización masiva");
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-orange-100 text-orange-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "CONFIRMED":
        return "Confirmado";
      case "PREPARING":
        return "Preparando";
      case "READY":
        return "Listo";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PENDING", label: "Pendiente" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "PREPARING", label: "Preparando" },
    { value: "READY", label: "Listo" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

  return {
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
    fetchOrders,
    fecthOrderWithParams,
    updateOrderStatus,
    bulkUpdateStatus,
    getStatusColor,
    getStatusText,
    statusOptions,
  };
}
