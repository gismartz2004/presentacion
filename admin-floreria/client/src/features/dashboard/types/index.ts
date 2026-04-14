interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueChange: {
    value: number;
    direction: "increase" | "decrease";
  };
  ordersChange: {
    value: number;
    direction: "increase" | "decrease";
  };
}

interface RecentOrder {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

export type { Stats, RecentOrder };