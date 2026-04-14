import { create } from "zustand";
import type { Order } from "../types";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  updateOrderStatusState: (orderId: string, newStatus: string) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  addOrder: (order: Order) =>
    set((state) => {
      // Evitar duplicados
      if (state.orders.find((o) => o.id === order.id)) return state;
      return { orders: [order, ...state.orders] };
    }),
  setOrders: (orders: Order[]) => set({ orders }),
  clearOrders: () => set({ orders: [] }),
  updateOrderStatusState: (orderId: string, newStatus: string) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ),
    })),
}));
