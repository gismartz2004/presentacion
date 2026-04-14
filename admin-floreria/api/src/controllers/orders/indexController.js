const { db: prisma } = require("../../lib/prisma");

function roundMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

exports.getAllOrders = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const status = req.query.status;
    const search = req.query.search;
    const range = req.query.range; // formato YYYY-MM-DD
    const dateStart = req.query.dateStart; // formato YYYY-MM-DD
    const dateEnd = req.query.dateEnd; // formato YYYY-MM-DD

    const where = {};
    let take = undefined;
    if (!isNaN(limit) && limit > 0) {
      take = limit;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { 
          customerEmail: { 
            not: null,
            contains: search, 
            mode: "insensitive" 
          } 
        },
      ];
    }
    // Manejo de filtros de fecha - prioridad: rango de fechas > día específico
    if (dateStart || dateEnd) {
      // Filtro por rango de fechas
      const dateFilter = {};

      if (dateStart) {
        // Validar formato YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart)) {
          return res.status(400).json({
            status: "error",
            message: "Formato de 'dateStart' inválido. Use YYYY-MM-DD",
          });
        }
        dateFilter.gte = new Date(dateStart + "T00:00:00.000Z");
      }

      if (dateEnd) {
        // Validar formato YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateEnd)) {
          return res.status(400).json({
            status: "error",
            message: "Formato de 'dateEnd' inválido. Use YYYY-MM-DD",
          });
        }
        // Incluir todo el día final hasta las 23:59:59
        const endDate = new Date(dateEnd + "T00:00:00.000Z");
        endDate.setUTCDate(endDate.getUTCDate() + 1);
        dateFilter.lt = endDate;
      }

      where.createdAt = dateFilter;
    } else if (range) {
      switch (range) {
        case "today": {
          const start = new Date();
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCDate(end.getUTCDate() + 1);
          where.createdAt = {
            gte: start,
            lt: end,
          };
          break;
        }
        case "this_week": {
          const start = new Date();
          const dayOfWeek = start.getUTCDay();
          start.setUTCDate(start.getUTCDate() - dayOfWeek);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCDate(end.getUTCDate() + 7);
          where.createdAt = {
            gte: start,
            lt: end,
          };
          break;
        }
        case "this_month": {
          const start = new Date();
          start.setUTCDate(1);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCMonth(end.getUTCMonth() + 1);
          where.createdAt = {
            gte: start,
            lt: end,
          };
          break;
        }
        case "this_year": {
          const start = new Date();
          start.setUTCMonth(0, 1);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setUTCFullYear(end.getUTCFullYear() + 1);
          where.createdAt = {
            gte: start,
            lt: end,
          };
          break;
        }
      }
    }

    const [ordersData] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    const orders = ordersData.map((order) => {
      // `totalAmount` is consumed by the admin UI as the final order total.
      // Do NOT recompute from items, because coupons/discounts can change the final total.
      const totalAmount = Number(order.total || 0);
      const itemsAmount = order.orderItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);

      // Fallback for legacy orders where discountAmount wasn't persisted:
      // estimate product discount by comparing current product price vs stored item price.
      // Note: this is an estimate if product prices changed after the order.
      const estimatedDiscountAmount = roundMoney(order.total_discount_amount);

      const shipping = Number(order.shipping || 0);
      const subtotal = Number(order.subtotal || 0);
      const tax = Number(order.tax || 0);
      const pendingAmount = shipping > 0 ? Math.max(0, subtotal + tax - shipping) : 0;

      return {
        ...order,
        totalAmount,
        itemsAmount: roundMoney(itemsAmount + order.product_discounted_amount),
        estimatedDiscountAmount,
        pendingAmount,
      };
    });

    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const data = req.body;
    const order = await prisma.order.create({
      data,
    });
    return res.status(201).json({ order });
  } catch (error) {
    return res.status(500).json({ error: "Error al crear orden" });
  }
};
