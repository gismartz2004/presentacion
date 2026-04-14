import service from "@/core/api/service";

const statesman = async () => {
  const res = await service.get("/statesman");
  return res.data;
};

const getOrderLimit = async (number: number) => {
  const res = await service.get(`/orders?limit=${number}`);
  return res.data;
};

const chartData = async () => {
  const res = await service.get("/chart-data");
  return res.data;
};

const dashboard_stats = {
  statesman,
  getOrderLimit,
  chartData,
};

export default dashboard_stats;
