const express = require("express");
const { db: prisma } = require("../../lib/prisma");

const router = express.Router();

async function getCompanyForAdmin(adminId) {
  if (!adminId) return null;

  return prisma.company.findFirst({
    where: {
      users: {
        some: {
          id: adminId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
}

function extractCustomerEmail(notes) {
  if (!notes) return "";

  const match = String(notes).match(/Correo\s+envia:\s*([^|]+)/i);
  return match?.[1]?.trim() || "";
}

async function findRecoveredOrderForCart(cart) {
  const abandonedAt = cart.abandonedAt || cart.createdAt;
  const customerEmail = extractCustomerEmail(cart.notes);
  const customerPhone = String(cart.customerPhone || "").trim();
  const or = [];

  if (customerPhone) {
    or.push({ customerPhone });
  }

  if (customerEmail) {
    or.push({ customerEmail });
  }

  if (!or.length) return null;

  return prisma.order.findFirst({
    where: {
      createdAt: {
        gt: abandonedAt,
      },
      OR: or,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      paymentStatus: true,
      status: true,
      createdAt: true,
    },
  });
}

router.get("/", async (req, res) => {
  try {
    const company = await getCompanyForAdmin(req.user?.adminId);
    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Empresa no encontrada para este usuario.",
      });
    }

    const { status, search } = req.query;
    const where = {
      companyId: company.id,
    };

    if (status && status !== "ALL") {
      where.status = String(status);
    }

    if (search) {
      where.OR = [
        { customerName: { contains: String(search), mode: "insensitive" } },
        { customerPhone: { contains: String(search), mode: "insensitive" } },
        { senderName: { contains: String(search), mode: "insensitive" } },
        { receiverName: { contains: String(search), mode: "insensitive" } },
        { exactAddress: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const carts = await prisma.abandonedCart.findMany({
      where,
      orderBy: [
        { abandonedAt: "desc" },
        { createdAt: "desc" },
      ],
    });
    const cartsWithRecovery = await Promise.all(
      carts.map(async (cart) => {
        const recoveredOrder = await findRecoveredOrderForCart(cart);

        if (recoveredOrder && cart.status !== "RECOVERED") {
          const updated = await prisma.abandonedCart.update({
            where: { id: cart.id },
            data: {
              status: "RECOVERED",
              recoveredAt: cart.recoveredAt || recoveredOrder.createdAt,
            },
          });

          return {
            ...updated,
            recoveredOrder,
          };
        }

        return {
          ...cart,
          recoveredOrder,
        };
      })
    );

    return res.json({
      status: "success",
      data: cartsWithRecovery,
    });
  } catch (error) {
    console.error("Get abandoned carts error:", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudieron cargar los carritos abandonados.",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const company = await getCompanyForAdmin(req.user?.adminId);
    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Empresa no encontrada para este usuario.",
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body || {};
    const allowedStatuses = ["NEW", "CONTACTED", "RECOVERED", "CLOSED"];

    if (status && !allowedStatuses.includes(String(status))) {
      return res.status(400).json({
        status: "error",
        message: "Estado no permitido.",
      });
    }

    const existing = await prisma.abandonedCart.findFirst({
      where: {
        id,
        companyId: company.id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Carrito abandonado no encontrado.",
      });
    }

    const data = {
      notes: typeof notes === "string" ? notes.trim() : existing.notes,
    };

    if (status) {
      data.status = String(status);
      if (status === "CONTACTED" && !existing.contactedAt) {
        data.contactedAt = new Date();
      }
      if (status === "RECOVERED") {
        data.recoveredAt = new Date();
      }
    }

    const updated = await prisma.abandonedCart.update({
      where: { id: existing.id },
      data,
    });

    return res.json({
      status: "success",
      data: updated,
    });
  } catch (error) {
    console.error("Update abandoned cart error:", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo actualizar el carrito abandonado.",
    });
  }
});

module.exports = router;
