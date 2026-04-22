const crypto = require("crypto");
const { db: prisma } = require("../../lib/prisma");

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
  });
}

function sanitizePaymentSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  const parseAmount = (value) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : NaN;
    }

    if (typeof value !== "string") return NaN;

    const normalized = value
      .trim()
      .replace(/\$/g, "")
      .replace(/\s+/g, "")
      .replace(",", ".");

    if (!normalized) return NaN;

    const numericValue = Number(normalized);
    return Number.isFinite(numericValue) ? numericValue : NaN;
  };
  const getString = (key) => {
    const value = source[key];
    return typeof value === "string" ? value.trim() : "";
  };
  const getSectorRates = (key) => {
    const value = source[key];
    if (!Array.isArray(value)) return [];

    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const sector = typeof item.sector === "string" ? item.sector.trim() : "";
        const numericCost = parseAmount(item.cost);
        const cost = Number.isFinite(numericCost) ? numericCost : NaN;

        if (!sector || !Number.isFinite(cost) || cost < 0) return null;

        return {
          sector,
          cost: Number(cost.toFixed(2)),
        };
      })
      .filter(Boolean);
  };
  const getEnvironment = (key, fallback = "sandbox") => {
    const value = getString(key).toLowerCase();
    return value === "live" ? "live" : fallback;
  };

  return {
    paypalEnvironment: getEnvironment("paypalEnvironment"),
    paypalSandboxClientId: getString("paypalSandboxClientId"),
    paypalSandboxClientSecret: getString("paypalSandboxClientSecret"),
    paypalSandboxMerchantId: getString("paypalSandboxMerchantId"),
    paypalSandboxWebhookId: getString("paypalSandboxWebhookId"),
    paypalLiveClientId: getString("paypalLiveClientId"),
    paypalLiveClientSecret: getString("paypalLiveClientSecret"),
    paypalLiveMerchantId: getString("paypalLiveMerchantId"),
    paypalLiveWebhookId: getString("paypalLiveWebhookId"),
    payphoneEnvironment: getEnvironment("payphoneEnvironment"),
    payphoneSandboxStoreId: getString("payphoneSandboxStoreId"),
    payphoneSandboxToken: getString("payphoneSandboxToken"),
    payphoneSandboxWebhookToken: getString("payphoneSandboxWebhookToken"),
    payphoneLiveStoreId: getString("payphoneLiveStoreId"),
    payphoneLiveToken: getString("payphoneLiveToken"),
    payphoneLiveWebhookToken: getString("payphoneLiveWebhookToken"),
    transferInstructions: getString("transferInstructions"),
    shippingSectorRates: getSectorRates("shippingSectorRates"),
    ownerNotificationEmail: getString("ownerNotificationEmail"),
    ownerNotificationName: getString("ownerNotificationName"),
  };
}

/**
 * Generar nueva API Key para la empresa
 * POST /api/admin/company/api-key
 */
const generateApiKey = async (req, res) => {
  try {
    const { companyId } = req.body;
    
    // Verificar que la empresa existe y el usuario tiene acceso
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        users: {
          some: {
            id: req.user.adminId // Del authMiddleware
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
        message: "No se encontró la empresa o no tienes acceso"
      });
    }

    // Generar nueva API Key
    const apiKey = 'ak_' + crypto.randomBytes(32).toString('hex');
    
    // Actualizar la empresa
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        apiKey,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        apiKey: true,
        webhookSecret: true,
        allowedDomains: true
      }
    });

    res.json({
      success: true,
      message: "API Key generada exitosamente",
      data: updatedCompany
    });

  } catch (error) {
    console.error("Error generando API Key:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al generar API Key"
    });
  }
};

/**
 * Generar nuevo Webhook Secret
 * POST /api/admin/company/webhook-secret
 */
const generateWebhookSecret = async (req, res) => {
  try {
    const { companyId } = req.body;
    
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        users: {
          some: {
            id: req.user.adminId
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
        message: "No se encontró la empresa o no tienes acceso"
      });
    }

    // Generar nuevo webhook secret
    const webhookSecret = 'ws_' + crypto.randomBytes(32).toString('hex');
    
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        webhookSecret,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        apiKey: true,
        webhookSecret: true,
        allowedDomains: true
      }
    });

    res.json({
      success: true,
      message: "Webhook Secret generado exitosamente",
      data: updatedCompany
    });

  } catch (error) {
    console.error("Error generando Webhook Secret:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al generar Webhook Secret"
    });
  }
};

/**
 * Actualizar dominios permitidos
 * PUT /api/admin/company/allowed-domains
 */
const updateAllowedDomains = async (req, res) => {
  try {
    const { companyId, domains } = req.body;
    
    // Validar que domains sea un array
    if (!Array.isArray(domains)) {
      return res.status(400).json({
        error: "Formato inválido",
        message: "Los dominios deben ser un array de strings"
      });
    }

    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        users: {
          some: {
            id: req.user.adminId
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
        message: "No se encontró la empresa o no tienes acceso"
      });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { 
        allowedDomains: domains,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        apiKey: true,
        webhookSecret: true,
        allowedDomains: true
      }
    });

    res.json({
      success: true,
      message: "Dominios permitidos actualizados exitosamente",
      data: updatedCompany
    });

  } catch (error) {
    console.error("Error actualizando dominios:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al actualizar dominios permitidos"
    });
  }
};

/**
 * Obtener configuración de API actual
 * GET /api/admin/company/:companyId/api-config
 */
const getApiConfig = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        users: {
          some: {
            id: req.user.adminId
          }
        }
      },
      select: {
        id: true,
        name: true,
        apiKey: true,
        webhookSecret: true,
        allowedDomains: true,
        updatedAt: true
      }
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
        message: "No se encontró la empresa o no tienes acceso"
      });
    }

    res.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error("Error obteniendo configuración de API:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al obtener configuración de API"
    });
  }
};

/**
 * Obtener logs de API requests
 * GET /api/admin/company/:companyId/api-logs
 */
const getApiLogs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 50, days = 7 } = req.query;
    
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        users: {
          some: {
            id: req.user.adminId
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        error: "Empresa no encontrada",
        message: "No se encontró la empresa o no tienes acceso"
      });
    }

    const skip = (page - 1) * limit;
    const daysAgo = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const [logs, total] = await Promise.all([
      prisma.apiRequest.findMany({
        where: {
          companyId: companyId,
          createdAt: {
            gte: daysAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.apiRequest.count({
        where: {
          companyId: companyId,
          createdAt: {
            gte: daysAgo
          }
        }
      })
    ]);

    // Estadísticas rápidas
    const stats = await prisma.apiRequest.groupBy({
      by: ['statusCode'],
      where: {
        companyId: companyId,
        createdAt: {
          gte: daysAgo
        }
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat.statusCode] = stat._count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error("Error obteniendo logs de API:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "Error al obtener logs de API"
    });
  }
};

const getPaymentSettings = async (req, res) => {
  try {
    const company = await getCompanyForAdmin(req.user?.adminId);

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Empresa no encontrada para este usuario.",
      });
    }

    return res.json({
      status: "success",
      data: {
        companyId: company.id,
        companyName: company.name,
        settings: company.settings || {},
      },
    });
  } catch (error) {
    console.error("Error getting payment settings:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la configuración de pagos.",
    });
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    const company = await getCompanyForAdmin(req.user?.adminId);

    if (!company) {
      return res.status(404).json({
        status: "error",
        message: "Empresa no encontrada para este usuario.",
      });
    }

    const currentSettings = company.settings && typeof company.settings === "object"
      ? company.settings
      : {};

    const paymentSettings = sanitizePaymentSettings(req.body);
    const mergedSettings = {
      ...currentSettings,
      paymentSettings,
    };

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        settings: mergedSettings,
      },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    return res.json({
      status: "success",
      message: "Configuración de pagos actualizada.",
      data: {
        companyId: updatedCompany.id,
        companyName: updatedCompany.name,
        settings: updatedCompany.settings || {},
      },
    });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al guardar la configuración de pagos.",
    });
  }
};

module.exports = {
  generateApiKey,
  generateWebhookSecret,
  updateAllowedDomains,
  getApiConfig,
  getApiLogs,
  getPaymentSettings,
  updatePaymentSettings,
};

