const jwt = require("jsonwebtoken");
const { getTenantIdByDomain } = require("../../prisma/prisma-service");


module.exports = async (req, res, next) => {
  const token = req.cookies.session;
  if (!token) {
    return res.status(401).json({ status: "error", message: "No autorizado" });
  }
  try {
     // --- 1. Verificación del JWT ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded; // Puedes usar req.user en los controladores

    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Token inválido" });
  }
};