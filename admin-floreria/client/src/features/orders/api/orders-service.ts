import ecommerceService from "@/core/api/ecommerce-service";

const get_all_orders = async (params: URLSearchParams) => {
  const response = await ecommerceService.get("/orders", { params });
  return response.data;
};

const get_order = async (id: string) => {
  const response = await ecommerceService.get(`/orders/${id}`);
  return response.data;
}

const update_order_status = async (id: string, data: object) => {
  const response = await ecommerceService.patch(`/orders/${id}/status`, data);
  return response.data;
};

const bulk_update_status = async (orderIds: string[], status: string) => {
  const response = await ecommerceService.patch('/orders/bulk-update', {
    orderIds,
    status,
    updatedBy: 'admin', // TODO: Get from auth context
  });
  return response.data;
};

const ordersService = {
  get_all_orders,
  get_order,
  update_order_status,
  bulk_update_status,
};

export default ordersService;
