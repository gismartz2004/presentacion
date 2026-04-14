const { db: prisma } = require("../../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { AdminLoginSchema } = require("../../validations/adminLoginSchema");

exports.login = async (req, res) => {
  try {
    const validation = AdminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Datos inválidos", details: validation.error.issues });
    }
    const { email, password } = validation.data;
    console.log(email, password);
    // Buscar admin por email
    const admin = await prisma.users.findUnique({
      where: { email },
    });
    console.log("Admin fetched from DB:", admin);
    if (!admin) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    console.log("Admin found:", admin);
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    console.log("Admin authenticated:", admin);
    // Crear token de sesión (JWT)
    const session = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "10d" }
    );

    // Enviar cookie (ajustes para dev/prod)
    const isProd = process.env.NODE_ENV === "production";
    // En producción, usamos Secure y SameSite=None para permitir cross-site si hace falta.
    // En desarrollo (http://localhost), no podemos usar Secure porque no hay HTTPS.
    res.cookie("session", session, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 10 * 1000, // 10 días
      path: "/",
    });

    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};
