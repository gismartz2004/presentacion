const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

/**
 * Middleware para validar API Keys de empresas externas
 * Uso: Para endpoints que reciben órdenes desde webs externas
 */
const apiKeyMiddleware = async (req, res, next) => {
  try {
    // Obtener API Key del header
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: "API Key requerida",
        message: "Debe proporcionar una API Key válida en el header 'X-API-Key'"
      });
    }

    // Buscar la empresa por API Key
    const company = await prisma.company.findUnique({
      where: { 
        apiKey: apiKey,
        isActive: true 
      },
      include: {
        subscription: true
      }
    });

    if (!company) {
      // Log del intento fallido
      await logApiRequest(req, null, 401, "Invalid API Key");
      
      return res.status(401).json({ 
        error: "API Key inválida",
        message: "La API Key proporcionada no es válida o la empresa está inactiva"
      });
    }

    // Verificar que la suscripción esté activa
    if (!company.subscription || company.subscription.status !== 'ACTIVE') {
      await logApiRequest(req, company.id, 402, "Subscription inactive");
      
      return res.status(402).json({ 
        error: "Suscripción inactiva",
        message: "La suscripción de la empresa no está activa"
      });
    }

    // Verificar dominio de origen (CORS avanzado)
    const origin = req.headers.origin;
    if (company.allowedDomains.length > 0 && origin) {
      const isAllowedDomain = company.allowedDomains.some(domain => 
        origin.includes(domain) || origin === domain
      );
      
      if (!isAllowedDomain) {
        await logApiRequest(req, company.id, 403, "Domain not allowed");
        
        return res.status(403).json({ 
          error: "Dominio no autorizado",
          message: "El dominio de origen no está en la lista de dominios permitidos"
        });
      }
    }

    // Rate limiting básico (opcional - puedes usar Redis para algo más robusto)
    const recentRequests = await prisma.apiRequest.count({
      where: {
        companyId: company.id,
        createdAt: {
          gte: new Date(Date.now() - 60000) // Último minuto
        }
      }
    });

    // Límite de 60 requests por minuto por empresa
    if (recentRequests >= 60) {
      await logApiRequest(req, company.id, 429, "Rate limit exceeded");
      
      return res.status(429).json({ 
        error: "Rate limit excedido",
        message: "Demasiadas peticiones. Límite: 60 por minuto"
      });
    }

    // Agregar la empresa al request
    req.company = company;
    
    // Agregar función para logging
    req.logApiRequest = (statusCode, message = "Success") => 
      logApiRequest(req, company.id, statusCode, message);

    next();
    
  } catch (error) {
    console.error("Error en apiKeyMiddleware:", error);
    return res.status(500).json({ 
      error: "Error interno del servidor",
      message: "Error al validar la API Key"
    });
  }
};

/**
 * Función para loggear requests de API
 */
const logApiRequest = async (req, companyId, statusCode, message = "") => {
  try {
    if (!companyId) return; // No loggear si no tenemos company
    
    const startTime = req.startTime || Date.now();
    const responseTime = Date.now() - startTime;
    
    await prisma.apiRequest.create({
      data: {
        companyId: companyId,
        endpoint: req.path,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress || "unknown",
        userAgent: req.headers['user-agent'],
        apiKeyUsed: req.headers['x-api-key']?.substring(0, 10) + "...", // Solo primeros 10 chars
        origin: req.headers.origin,
        statusCode: statusCode,
        responseTime: responseTime,
        metadata: {
          message: message,
          body: req.method === 'POST' ? req.body : undefined,
          query: Object.keys(req.query).length > 0 ? req.query : undefined
        }
      }
    });
  } catch (error) {
    console.error("Error logging API request:", error);
  }
};

/**
 * Middleware para agregar timestamp de inicio
 */
const addStartTime = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

module.exports = { 
  apiKeyMiddleware,
  addStartTime,
  logApiRequest
};