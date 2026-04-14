const { db: prisma } = require("../../lib/prisma");

// Ejemplo: obtener cantidad de órdenes por día
exports.getChartData = async (req, res) => {
  try {
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Fetch real data from the database grouped by month
    const orders = await prisma.$queryRawUnsafe(`
      SELECT 
        TO_CHAR("createdAt", 'Month') AS month,
        SUM("total") AS revenue,
        COUNT("id") AS orders
      FROM "orders"
      GROUP BY TO_CHAR("createdAt", 'Month')
      ORDER BY MIN("createdAt")
    `);
    console.log("Fetched chart data:", orders);

    // Map database results to include all months
    const ordersMap = new Map(
      orders.map((order) => [order.month.trim(), order])
    );

    const completeData = allMonths.map((month) => {
      const order = ordersMap.get(month) || {
        month,
        revenue: BigInt(0),
        orders: BigInt(0),
      };
      return {
        month,
        revenue: Number(order.revenue),
        orders: Number(order.orders),
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Datos de gráficos obtenidos",
      data: completeData,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener datos de gráficos" });
  }
};
