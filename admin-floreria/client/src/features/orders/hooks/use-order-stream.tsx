import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useOrdersStore } from "../store/order-store";
import ordersService from "../api/orders-service";
import type { Order } from "../types";

interface OrderEvent {
  id: string;
  status: string;
  order?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
}

interface UseOrderStreamOptions {
  enabled?: boolean;
  apiBase?: string;
}

export function useOrderStream({
  enabled = true,
  apiBase = import.meta.env.VITE_API_URL,
}: UseOrderStreamOptions = {}) {
  const addOrder = useOrdersStore((s) => s.addOrder);
  // Opcional si luego agregas estos métodos:
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatusState);
  //   const removeOrder = useOrdersStore((s: any) => s.removeOrder?.);

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const manuallyClosedRef = useRef(false);

  function showSystemNotification(title: string, body?: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png", // opcional: ruta a tu icono
        tag: "order-update", // evita notificaciones duplicadas
      });
    }
  }

  useEffect(() => {
    if (!enabled) return;
    if (!apiBase) return;

    manuallyClosedRef.current = false;

    const baseUrl = apiBase.replace(/\/$/, "") + "/events/orders/stream";

    const maxDelay = 30000; // 30s tope
    const computeDelay = (attempt: number) =>
      Math.min(1000 * Math.pow(2, attempt), maxDelay);

    const clearTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeCurrent = () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };

    const computeTotal = (o: Order) =>
      o?.orderItems
        ? o.totalAmount
        : 0;

    const connect = () => {
      console.log("Connecting to order stream...");
      clearTimer();
      closeCurrent();
      if (manuallyClosedRef.current) return;

      const es = new EventSource(baseUrl, {
        withCredentials: true,
      } as EventSourceInit);
      esRef.current = es;
      es.addEventListener("ready", () => {
        attemptsRef.current = 0; // éxito → reset
        console.log("Connected to order stream");
      });

      es.addEventListener("order.created", async (evt: MessageEvent) => {
        console.log("New order event received");
        try {
          const partial: OrderEvent = JSON.parse(evt.data);
          // Evitar fetch doble si decides enviar payload completo desde backend
          const response = await ordersService.get_order(partial.id);
          if (response.status === "success" && response.data) {
            console.log("ORDER FETCHED FROM RESPONSE DATA BEFORE: ", response.data);
            const fetched: Order = response.data;
            console.log("ORDER FETCHED FROM REALTIME AFTER: ", fetched);
            fetched.totalAmount = computeTotal(fetched);
            addOrder(fetched);

            const msg = `Nueva orden NR.${partial.order} creada`;
            toast.info(msg);
            showSystemNotification("Nueva orden creada", msg);
          }
        } catch (e) {
          console.error("Error manejando order.created", e);
        }
      });

      es.addEventListener("order.status.updated", (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data) as {
            id: string;
            status: string;
            order: string;
          };
          if (updateOrderStatus) updateOrderStatus(payload.id, payload.status);
          toast.info(
            `Orden ${payload.order} → ${payload.status.toLowerCase()}`
          );
        } catch (e) {
          console.error("Error manejando order.status.updated", e);
        }
      });

      //   es.addEventListener("order.deleted", (evt: MessageEvent) => {
      //     // try {
      //     //   const payload = JSON.parse(evt.data) as { id: string };
      //     //   if (removeOrder) removeOrder(payload.id);
      //     //   toast.warning(`Orden eliminada ${payload.id}`);
      //     // } catch (e) {
      //     //   console.error("Error manejando order.deleted", e);
      //     // }
      //   });

      es.onerror = () => {
        // EventSource ya reintenta solo; forzamos control propio si cierra
        if (es.readyState === EventSource.CLOSED) scheduleReconnect();
      };

      es.onopen = () => {
        attemptsRef.current = 0;
      };
    };

    const scheduleReconnect = () => {
      if (manuallyClosedRef.current) return;
      const attempt = attemptsRef.current++;
      const delay = computeDelay(attempt);
      clearTimer();
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    connect();

    return () => {
      manuallyClosedRef.current = true;
      clearTimer();
      closeCurrent();
    };
  }, [enabled, apiBase, addOrder, updateOrderStatus]);
}
