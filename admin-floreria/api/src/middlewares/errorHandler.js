const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");

// Centralized error handler for Express
module.exports = function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) return next(err);

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const code = err.code;
    switch (code) {
      case "P2002": // Unique constraint failed
        return res.status(409).json({
          status: "error",
          message: "Violación de restricción única",
          code,
          details: err.meta || undefined,
        });
      case "P2003": // Foreign key constraint failed
        return res.status(409).json({
          status: "error",
          message: "Fallo de integridad referencial (foreign key)",
          code,
          details: err.meta || undefined,
        });
      case "P2025": // Record not found
        return res.status(404).json({
          status: "error",
          message: "Registro no encontrado",
          code,
          details: err.meta || undefined,
        });
      case "P2014": // Invalid relation
        return res.status(400).json({
          status: "error",
          message: "Relación inválida",
          code,
          details: err.meta || undefined,
        });
      case "P2000": // Value too long
        return res.status(400).json({
          status: "error",
          message: "Valor fuera de rango",
          code,
          details: err.meta || undefined,
        });
      default:
        return res.status(500).json({
          status: "error",
          message: "Error de base de datos",
          code,
          details: err.meta || undefined,
        });
    }
  }

  // Prisma validation/runtime errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Validación de datos de Prisma falló",
      details: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      status: "error",
      message: "Falló la inicialización de la base de datos",
      details: err.message,
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Datos inválidos",
      details: err.issues,
    });
  }

  // Generic fallback
  const status = err.status || 500;
  return res.status(status).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
}
