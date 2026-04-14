const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const juice = require("juice");
const fs = require("fs").promises;
const path = require("path");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Usar la configuración existente del .env
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verificar la conexión al inicializar (sin bloquear y de forma silenciosa)
    this.verifyConnection().catch(() => {
      // Silenciar el error en la inicialización para no ensuciar la consola
    });
  }

  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates",
        `${templateName}.hbs`
      );
      const templateContent = await fs.readFile(templatePath, "utf-8");
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw error;
    }
  }

  async sendInvoiceEmail(orderData) {
    try {
      console.log("Sending invoice email for order:", orderData.orderNumber);

      // Cargar la plantilla de factura
      const template = await this.loadTemplate("invoice");

      // Calcular datos adicionales para la plantilla
      const invoiceData = {
        ...orderData,
        // Lógica de reserva: si shipping > 0, el valor cobrado es la reserva y el resto queda pendiente
        isReservation: Number(orderData.shipping || 0) > 0,
        chargedAmount: Number(orderData.shipping || 0),
        remainingBalance: Math.max(
          0,
          Number(orderData.subtotal || 0) +
            Number(orderData.tax || 0) -
            Number(orderData.shipping || 0)
        ),
        invoiceDate: new Date().toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        companyName: process.env.COMPANY_NAME || "Mi Panadería",
        companyEmail: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
        companyPhone: process.env.COMPANY_PHONE || "+1 (555) 123-4567",
        companyAddress:
          process.env.COMPANY_ADDRESS || "123 Calle Principal, Ciudad",
        // Formatear items para la plantilla
        formattedItems:
          orderData.items?.map((item) => ({
            ...item,
            formattedPrice: `$${item.price.toFixed(2)}`,
            formattedTotal: `$${(item.price * item.quantity).toFixed(2)}`,
          })) || [],
        // Formatear totales
        formattedSubtotal: `$${orderData.subtotal.toFixed(2)}`,
        formattedTax: `$${(orderData.tax || 0).toFixed(2)}`,
        formattedShipping: `$${(orderData.shipping || 0).toFixed(2)}`,
        formattedTotal: `$${(
          Number(orderData.subtotal || 0) + Number(orderData.tax || 0)
        ).toFixed(2)}`,
        formattedChargedAmount: `$${Number(orderData.shipping || 0).toFixed(
          2
        )}`,
        formattedRemainingBalance: `$${Math.max(
          0,
          Number(orderData.subtotal || 0) +
            Number(orderData.tax || 0) -
            Number(orderData.shipping || 0)
        ).toFixed(2)}`,
        estimatedDelivery: ["Guayaquil", "Durán", "Samborondón"].includes(
          orderData.billingCity
        )
          ? 2
          : 4,
      };

      //   const template = await this.loadTemplate('invoice');
      const htmlBeforeInline = template(invoiceData);

      // Inliner: convierte el CSS en estilos inline para máxima compatibilidad
      const htmlContent = juice(htmlBeforeInline, {
        preserveMediaQueries: false,
        removeStyleTags: true,
      });
      // Generar el HTML de la factura
      //   const htmlContent = template(invoiceData);

      // Configurar el email
      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          `"${process.env.COMPANY_NAME || "Mi Panadería"}" <${
            process.env.EMAIL_USER
          }>`,
        to: orderData.customerEmail,
        subject: `Factura de tu pedido NR.${orderData.orderNumber}`,
        html: htmlContent,
        attachments: [
          // Opcional: adjuntar logo u otros archivos
          {
            filename: "logo-perfumeriasz.jpg",
            path: path.join(__dirname, "../assets/logo-perfumeriasz.jpg"),
            cid: "logo", // Para usar en el HTML como <img src="cid:logo"/>
          },
        ],
      };

      // Enviar el email
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Invoice email sent successfully:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendOrderConfirmation(orderData) {
    try {
      console.log("Sending order confirmation for:", orderData.orderNumber);

      // Plantilla simple de confirmación
      const template = await this.loadTemplate("order-confirmation");

      const isReservation = Number(orderData.shipping || 0) > 0;
      const chargedAmount = Number(orderData.shipping || 0);
      const remainingBalance = Math.max(
        0,
        Number(orderData.subtotal || 0) +
          Number(orderData.tax || 0) -
          chargedAmount
      );

      const confirmationData = {
        ...orderData,
        isReservation,
        chargedAmount,
        remainingBalance,
        formattedChargedAmount: `$${chargedAmount.toFixed(2)}`,
        formattedRemainingBalance: `$${remainingBalance.toFixed(2)}`,
        // createdAt: new Date(orderData.createdAt).toLocaleDateString("es-EC", {
        //   year: "numeric",
        //   month: "long",
        //   day: "numeric",
        // }),
      };

      const htmlContent = template(confirmationData);

      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          `"${process.env.COMPANY_NAME || "Mi Panadería"}" <${
            process.env.EMAIL_USER
          }>`,
        to: orderData.customerEmail,
        subject: `Confirmación de pedido #${orderData.orderNumber}`,
        html: htmlContent,
        attachments: [
          // Opcional: adjuntar logo u otros archivos
          {
            filename: "logo-perfumeriasz.jpg",
            path: path.join(__dirname, "../assets/logo-perfumeriasz.jpg"),
            cid: "logo", // Para usar en el HTML como <img src="cid:logo"/>
          },
        ],
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Confirmation email sent successfully:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendDiscountCodeEmail(discount_code, customerEmail) {
    try {
      console.log("Sending discount code email:", discount_code);

      // Cargar la plantilla de factura
      const template = await this.loadTemplate("discount_code");

      // Calcular datos adicionales para la plantilla
      const emailData = {
        discountCode: discount_code,
        storeUrl: process.env.STORE_URL || 'https://perfumeriasz.com',
        companyName: process.env.COMPANY_NAME || "Mi Panadería",
        companyEmail: process.env.COMPANY_EMAIL || process.env.EMAIL_USER
      };

      //   const template = await this.loadTemplate('invoice');
      const htmlBeforeInline = template(emailData);

      // Inliner: convierte el CSS en estilos inline para máxima compatibilidad
      const htmlContent = juice(htmlBeforeInline, {
        preserveMediaQueries: false,
        removeStyleTags: true,
      });
      // Generar el HTML de la factura
      //   const htmlContent = template(invoiceData);

      // Configurar el email
      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          `"${process.env.COMPANY_NAME || "Mi Panadería"}" <${
            process.env.EMAIL_USER
          }>`,
        to: customerEmail,
        subject: `Código de descuento`,
        html: htmlContent,
        attachments: [
          // Opcional: adjuntar logo u otros archivos
          /*
          {
            filename: 'logo.png',
            path: path.join(__dirname, '../assets/logo.png'),
            cid: 'logo' // Para usar en el HTML como <img src="cid:logo"/>
          }
          */
        ],
      };

      // Enviar el email
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Discount code email sent successfully:", result.messageId);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Error sending invoice email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyConnection() {
    try {
      if (!this.transporter) return false;
      await this.transporter.verify();
      console.log("✅ Email service ready");
      return true;
    } catch (error) {
      console.log("⚠️  Email service: Credentials pending/invalid (Ready to use when configured)");
      return false;
    }
  }
}

module.exports = new EmailService();
