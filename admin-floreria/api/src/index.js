// Importar Express
const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middlewares/authMiddleware");
const featureMiddleware = require("./middlewares/featureMiddleware");

dotenv.config();

const path = require('path');
// Inicializar la aplicación Express
const app = express();
// Definir el puerto para el servidor
const PORT = process.env.PORT;

// Middlewares

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const originEnv = process.env.CORS_ORIGIN || '';
const allowedOrigins = originEnv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // En desarrollo, si no se configuró, permite el origen que venga (para localhost)
      if (!allowedOrigins.length && requestOrigin) return callback(null, true);
      if (!requestOrigin) return callback(null, false);
      if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Servir archivos estáticos de la carpeta uploads 
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route (sin autenticación)
const healthRoutes = require("./routes/health");
app.use("/api/health", healthRoutes);
// Eventos
const eventsRoutes = require("./routes/events/index");
app.use("/api/events", eventsRoutes);
// Rutas
const adminLoginRoutes = require("./routes/admin/login");
app.use("/api/admin/login", adminLoginRoutes);
const adminLogoutRoutes = require("./routes/admin/logout");
app.use("/api/admin/logout", authMiddleware, adminLogoutRoutes);
const adminMeRoutes = require("./routes/admin/me");
app.use("/api/admin/metadata", adminMeRoutes);
const featuresRoutes = require("./routes/features/features");
app.use("/api/features", featuresRoutes);
app.use("/features", featuresRoutes);

const statesmanRoutes = require("./routes/statesman/index");
app.use("/api/statesman", authMiddleware, statesmanRoutes);
const uploadRoutes = require("./routes/upload/index");
app.use("/api/upload", authMiddleware, uploadRoutes);
const checkoutRoutes = require("./routes/checkout/index");
app.use("/api/checkout", checkoutRoutes);
const checkoutSaveEmail = require("./routes/checkout/index");
app.use("api/checkout/saveEmailSuscription", checkoutSaveEmail);
const checkoutGetPercentDiscount = require("./routes/checkout/index");
app.use("api/checkout/get-percent-discount", checkoutGetPercentDiscount);
const checkoutValidateUseCodeDiscount = require("./routes/checkout/index");
app.use("api/checkout/validate-use-discount-code", checkoutValidateUseCodeDiscount)
const checkoutGetCouponDiscount = require("./routes/checkout/index");
app.use("api/checkout/get-coupon-discount", checkoutGetCouponDiscount)
const chartDataRoutes = require("./routes/chart-data/index");
app.use("/api/chart-data", chartDataRoutes);
const orderIdRoutes = require("./routes/orders/id");
app.use("/api/orders", authMiddleware, orderIdRoutes);
app.use("/orders", authMiddleware, orderIdRoutes);
const ordersRoutes = require("./routes/orders/index");
app.use("/api/orders", authMiddleware, ordersRoutes);
app.use("/orders", authMiddleware, ordersRoutes);
const productIdRoutes = require("./routes/products/id");
const productsRoutes = require("./routes/products/index");
app.use("/api/products", authMiddleware, productsRoutes);
app.use("/api/products", authMiddleware, productIdRoutes);
const filterRoutes = require("./routes/filters/index");
app.use("/api/filters", authMiddleware, filterRoutes);

const discountsRoutes = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), discountsRoutes);
const couponsRoutes = require("./routes/coupons/index");
app.use("/api/coupons", authMiddleware, couponsRoutes);
const discountIdRoutes = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), discountIdRoutes);
const typeDiscountRoutes = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), typeDiscountRoutes);
const updateDiscountRoutes = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), updateDiscountRoutes);
const createDiscountRoutes = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), createDiscountRoutes);
const deleteDiscount = require("./routes/discounts/index");
app.use("/api/discounts", featureMiddleware("discounts"), deleteDiscount)
// Rutas externas para integración con webs (sin authMiddleware)
const externalRoutes = require("./routes/external/index");
app.use("/api/external", externalRoutes);

// Productos públicos para la tienda
const externalProductsRoutes = require("./routes/external/products");
const externalCmsRoutes = require("./routes/external/cms");
const externalCompanyRoutes = require("./routes/external/company");
const externalReviewsRoutes = require("./routes/external/reviews");

app.use("/api/external/products", externalProductsRoutes);
app.use("/api/external/cms", externalCmsRoutes);
app.use("/api/external/company", externalCompanyRoutes);
app.use("/api/external/reviews", externalReviewsRoutes);

// Órdenes desde la tienda pública
const storeOrdersRoutes = require("./routes/external/store-orders");
app.use("/api/external/store-orders", storeOrdersRoutes);

// Rutas admin para gestión de API keys
const companyRoutes = require("./routes/admin/company");
app.use("/api/admin/company", authMiddleware, companyRoutes);

const cmsRoutes = require("./routes/cms/index");
app.use("/api/cms", authMiddleware, cmsRoutes);
app.use("/cms", authMiddleware, cmsRoutes);

// Ruta de prueba
app.get("/api/prueba", (req, res) => {
  res.send("¡Hola Mundo con Node.js y Express!");
});

// Error handler (debe ir después de registrar las rutas)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Iniciar el servidor en el puerto definido
const HOST = '0.0.0.0'; // <--- ASEGÚRATE DE USAR ESTO POR SEA ACASO

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Error al iniciar el servidor:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`   El puerto ${PORT} ya está en uso. Intenta cerrando otros procesos.`);
    }
    process.exit(1);
});