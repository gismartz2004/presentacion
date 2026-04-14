const { db } = require("../../lib/prisma");

// Utility function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  const change = ((current - previous) / previous) * 100;
  return parseFloat(change.toFixed(2));
};

// Aquí iría la lógica para obtener datos de statesman
exports.getStatesmanData = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all necessary data in a single query
    const [currentMonthOrders, lastMonthOrders, pendingOrdersCount] =
      await Promise.all([
        db.order.findMany({
          where: {
            status: "DELIVERED",
            createdAt: { gte: startOfMonth },
          },
          orderBy: { createdAt: "desc" },
        }),
        db.order.findMany({
          where: {
            status: "DELIVERED",
            createdAt: { gte: startOfLastMonth, lt: endOfLastMonth },
          },
        }),
        db.order.count({
          where: { status: "PENDING" },
        }),
      ]);

    // Calculate total revenue and percentage change
    const totalRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const revenueChange = calculatePercentageChange(
      totalRevenue,
      lastMonthRevenue
    );

    // Calculate total orders and percentage change
    const totalOrders = currentMonthOrders.length;
    const lastMonthTotalOrders = lastMonthOrders.length;
    const ordersChange = calculatePercentageChange(
      totalOrders,
      lastMonthTotalOrders
    );

    // Prepare response data
    const response = {
      revenue: {
        total: totalRevenue,
        change: {
          value: revenueChange,
          direction: revenueChange > 0 ? "increase" : "decrease",
        },
      },
      orders: {
        total: totalOrders,
        change: {
          value: ordersChange,
          direction: ordersChange > 0 ? "increase" : "decrease",
        },
      },
      pendingOrders: pendingOrdersCount,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching dashboard data." });
  }
};
