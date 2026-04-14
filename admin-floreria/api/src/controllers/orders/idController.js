const { db: prisma } = require("../../lib/prisma");
const { orderEvents } = require("../../events/orderEvents");

function roundMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    const totalAmount = Number(order.total || 0);
    const shipping = Number(order.shipping || 0);
    const subtotal = Number(order.subtotal || 0);
    const tax = Number(order.tax || 0);
    const pendingAmount = shipping > 0 ? Math.max(0, subtotal + tax - shipping) : 0;
    const estimatedDiscountAmount = roundMoney(order.total_discount_amount);

    const orderWithPending = { ...order, totalAmount, estimatedDiscountAmount, pendingAmount };
    return res.status(200).json({
      status: "success",
      message: "Orden obtenida",
      data: orderWithPending,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener orden" });
  }
};

exports.updateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const order = await prisma.order.update({
      where: { id },
      data,
    });
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ error: "Error al actualizar orden" });
  }
};

exports.updateStateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status es requerido",
      });
    }

    // Validar que el status sea válido
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status inválido",
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Emitir evento de actualización de estado
    orderEvents.emit("order.status.updated", {
      id: order.id,
      status: order.status,
      order: order.orderNumber,
      customerName: order.customerName,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      status: "success",
      message: "Estado actualizado correctamente",
      data: { order },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar estado de la orden",
      details: error.message,
    });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id },
    });
    return res.status(200).json({ message: "Orden eliminada" });
  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar orden" });
  }
};
