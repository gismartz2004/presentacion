const jwt = require('jsonwebtoken');
const { db: prisma } = require('../../lib/prisma');
const { hashPassword } = require('../../lib/password');
const { getTenantIdByDomain, getAvailableFeatures } = require('../../../prisma/prisma-service');

exports.me = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado"
      });
    }
    console.log("Fetching admin profile with token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const admin = await prisma.users.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, name: true, role: true }
    });
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin no encontrado"
      });
    }
    console.log("Admin profile fetched:", admin);
    return res.status(200).json({
      status: "success",
      message: "Perfil obtenido",
      data: {
        admin
      }
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(401).json({
      status: "error",
      message: "Token inválido o expirado"
    });
  }
};

// Update admin profile
exports.updateMe = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado"
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { name, email, password } = req.body;

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    const admin = await prisma.users.update({
      where: { id: decoded.adminId },
      data: updateData,
      select: { id: true, email: true, name: true }
    });

    return res.status(200).json({
      status: "success",
      message: "Perfil actualizado correctamente",
      data: {
        admin
      }
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar el perfil"
    });
  }
};

function extractTenantDomain(fullHost) {
  if (!fullHost) return null;

  // Quitar puerto y normalizar
  const host = fullHost.split(":")[0].toLowerCase();

  // 🧪 Ambiente local
  if (host === "localhost" || host.endsWith(".localhost")) {
    const parts = host.split(".");
    // perfumeriasz.localhost -> perfumeriasz
    return parts.length > 1 ? parts[0] : "localhost";
  }

  const parts = host.split(".");

  // admin.perfumeriasz.com → perfumeriasz
  // perfumeriasz.com → perfumeriasz
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return null;
}

exports.features = async (req, res) => {
  try {
    const fullHost = req.headers.host;
    const tenantDomain = extractTenantDomain(fullHost);

    if (!tenantDomain) {
      return res.status(400).json({ status: "error", message: "Dominio inválido", data: null });
    }

    console.log(`Me Controller: Extracted tenant domain: ${tenantDomain}`);
    const tenantId = await getTenantIdByDomain(tenantDomain);
    // const tenantId = null; // Deshabilitado temporalmente
    console.log(`Me Controller: Resolved tenant ID: ${tenantId} for domain: ${tenantDomain}`);

    if (!tenantId) {
      console.warn(`Me Controller: Tenant no encontrado para el dominio: ${tenantDomain}`);
      return res.status(404).json({ status: "error", message: "Tenant no encontrado para esta sesión.", data: null });
    }

    const features = await getAvailableFeatures(tenantId);

    return res.status(200).json({
      status: "success",
      message: "Características obtenidas",
      data: {
        features: features.map(item => ({display_name: item.features.display_name, name: item.features.name}))
      }
    });
  } catch (error) {
    console.error("Error fetching features:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener las características",
      data: null
    });
  }
}
