import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingBag,
  ChevronLeft,
  CreditCard,
  Truck,
  User,
  CheckCircle,
  Loader2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  FileText,
  Landmark,
  Smartphone,
  Globe2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useCompany } from "@/hooks/useCompany";

import { CartDialog } from "@/components/CartDialog";
import { Seo } from "@/components/Seo";

type OrderStatus = "idle" | "loading" | "success" | "error";
type PaymentMethod = "PayPal" | "Payphone" | "Banco" | "Zelle";
type CheckoutStep = "sender" | "receiver" | "payment";
type ShippingSectorRate = { sector: string; cost: number };
type CheckoutFocusable = HTMLInputElement | HTMLTextAreaElement;

function normalizeSectorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const CHECKOUT_STEPS: {
  id: CheckoutStep;
  label: string;
  helper: string;
  Icon: typeof User;
}[] = [
  {
    id: "sender",
    label: "Tus datos",
    helper: "Quién envía",
    Icon: User,
  },
  {
    id: "receiver",
    label: "Entrega",
    helper: "Quién recibe",
    Icon: Truck,
  },
  {
    id: "payment",
    label: "Pago",
    helper: "Confirmación",
    Icon: CreditCard,
  },
];

const PAYMENT_METHODS: {
  label: PaymentMethod;
  description: string;
  Icon: typeof CreditCard;
}[] = [
  {
    label: "PayPal",
    description: "Pago internacional o con tarjeta de crédito",
    Icon: Globe2,
  },
  {
    label: "Payphone",
    description: "Pago local con tarjeta desde la pasarela segura",
    Icon: Smartphone,
  },
  {
    label: "Banco",
    description: "Transferencia bancaria con comprobante",
    Icon: Landmark,
  },
  {
    label: "Zelle",
    description: "Pago por Zelle; el vendedor confirmará los datos",
    Icon: CreditCard,
  },
];

const CHECKOUT_STEP_LABELS: Record<CheckoutStep, string> = {
  sender: "Datos de quien envia",
  receiver: "Datos de quien recibe",
  payment: "Metodo de pago",
};

const DEFAULT_TRANSFER_INSTRUCTIONS = `Banco Pichincha cta ahorro # 2202306049
Banco Pacifico cta ahorro # 0851179635
Banco Guayaquil cta ahorro # 1389429

Nombre: Maritza Iveth Medranda Flor
CI: 0910784024
Correo: ventas@difiori.com.ec`;

const DEFAULT_ZELLE_INSTRUCTIONS = `Correo Zelle: rosamoncada085@gmail.com
Titular: Roberto Rodriguez`;

function normalizeSectorRates(value: unknown): ShippingSectorRate[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const source = item && typeof item === "object" ? item : {};
      const sector = typeof (source as { sector?: unknown }).sector === "string"
        ? String((source as { sector?: unknown }).sector).trim()
        : "";
      const rawCost = (source as { cost?: unknown }).cost;
      const cost = Number(rawCost);

      if (!sector || !Number.isFinite(cost) || cost < 0) return null;

      return { sector, cost };
    })
    .filter((item): item is ShippingSectorRate => Boolean(item));
}

function resolveShippingCostBySector(
  sector: string,
  rates: ShippingSectorRate[]
) {
  const normalizedSector = normalizeSectorName(sector);
  if (!normalizedSector) {
    return { cost: 0, matchedSector: "", isMatched: false };
  }

  const exactMatch = rates.find(
    (item) => normalizeSectorName(item.sector) === normalizedSector
  );

  if (exactMatch) {
    return {
      cost: exactMatch.cost,
      matchedSector: exactMatch.sector,
      isMatched: true,
    };
  }

  const partialMatch = rates.find((item) => {
    const candidate = normalizeSectorName(item.sector);
    return normalizedSector.includes(candidate) || candidate.includes(normalizedSector);
  });

  if (partialMatch) {
    return {
      cost: partialMatch.cost,
      matchedSector: partialMatch.sector,
      isMatched: true,
    };
  }

  return { cost: 0, matchedSector: "", isMatched: false };
}

export default function Checkout() {
  const { items, cartTotal, clearCart, setIsCartOpen, isCartLoading } = useCart();
  const [, setLocation] = useLocation();
  const { data: company } = useCompany();
  const [activeStep, setActiveStep] = useState<CheckoutStep>("sender");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Banco");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [isCartOpening, setIsCartOpening] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [sectorInput, setSectorInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent_value: number;
    amount: number | null;
    type: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofMessage, setProofMessage] = useState("");
  const payphoneBoxStorageKey = "pp_box_payload";
  const transferInstructions =
    company?.settings?.paymentSettings?.transferInstructions ||
    DEFAULT_TRANSFER_INSTRUCTIONS;
  const shippingSectorRates = useMemo(
    () => normalizeSectorRates(company?.settings?.paymentSettings?.shippingSectorRates),
    [company?.settings?.paymentSettings?.shippingSectorRates]
  );
  const shippingResolution = useMemo(
    () => resolveShippingCostBySector(sectorInput, shippingSectorRates),
    [sectorInput, shippingSectorRates]
  );
  const sectorSuggestions = useMemo(() => {
    const query = normalizeSectorName(sectorInput);
    if (!query) return [];

    return shippingSectorRates
      .filter((item) => normalizeSectorName(item.sector).includes(query))
      .slice(0, 6);
  }, [sectorInput, shippingSectorRates]);

  const receiverNameRef = useRef<HTMLInputElement>(null);
  const receiverPhoneRef = useRef<HTMLInputElement>(null);
  const senderNameRef = useRef<HTMLInputElement>(null);
  const senderEmailRef = useRef<HTMLInputElement>(null);
  const senderPhoneRef = useRef<HTMLInputElement>(null);
  const sectorRef = useRef<HTMLInputElement>(null);
  const dateTimeRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cardMessageRef = useRef<HTMLTextAreaElement>(null);
  const observationsRef = useRef<HTMLTextAreaElement>(null);

  const abandonmentSent = useRef(false);
  const abandonmentSessionId = useRef(
    `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const checkoutStateRef = useRef({
    activeStep,
    appliedCoupon,
    cartTotal,
    items,
    orderStatus,
    paymentMethod,
    shippingCost: shippingResolution.cost,
  });

  const readCheckoutFields = () => {
    const senderName = senderNameRef.current?.value.trim() || "";
    const senderEmail = senderEmailRef.current?.value.trim() || "";
    const senderPhone = senderPhoneRef.current?.value.trim() || "";
    const receiverName = receiverNameRef.current?.value.trim() || "";
    const receiverPhone = receiverPhoneRef.current?.value.trim() || "";
    const deliveryDateTime = dateTimeRef.current?.value.trim() || "";
    const address = addressRef.current?.value.trim() || "";
    const cardMessage = cardMessageRef.current?.value.trim() || "";
    const observations = observationsRef.current?.value.trim() || "";
    const sector = sectorInput.trim();
    return {
      senderName,
      senderEmail,
      senderPhone,
      receiverName,
      receiverPhone,
      deliveryDateTime,
      address,
      sector,
      exactAddress: address,
      cardMessage,
      observations,
    };
  };

  useEffect(() => {
    checkoutStateRef.current = {
      activeStep,
      appliedCoupon,
      cartTotal,
      items,
      orderStatus,
      paymentMethod,
      shippingCost: shippingResolution.cost,
    };
  }, [activeStep, appliedCoupon, cartTotal, items, orderStatus, paymentMethod, shippingResolution.cost]);

  const handleAbandonment = useCallback(() => {
    const checkoutState = checkoutStateRef.current;

    if (
      abandonmentSent.current ||
      checkoutState.orderStatus === "success" ||
      checkoutState.items.length === 0
    ) {
      return;
    }

    const {
      senderName,
      senderEmail,
      senderPhone,
      receiverName,
      receiverPhone,
      deliveryDateTime,
      exactAddress,
      sector,
      cardMessage,
      observations,
    } = readCheckoutFields();

    const hasSenderData = Boolean(senderName && senderEmail && senderPhone);
    const hasReceiverData = Boolean(
      receiverName &&
        receiverPhone &&
        deliveryDateTime &&
        exactAddress &&
        sector &&
        cardMessage
    );
    const hasReceiverProgress = Boolean(
      receiverName ||
        receiverPhone ||
        deliveryDateTime ||
        exactAddress ||
        sector ||
        cardMessage ||
        observations
    );

    if (!hasSenderData) return;

    const customerName = senderName || receiverName || "Cliente sin nombre";
    const contactPhone = senderPhone || receiverPhone || "No proporcionado";
    const checkoutStep: CheckoutStep =
      checkoutState.activeStep === "payment" && hasReceiverData
        ? "payment"
        : hasReceiverProgress
          ? "receiver"
          : "sender";

    fetch("/api/external/store-orders/abandoned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone: contactPhone,
        senderName: senderName || "",
        senderEmail: senderEmail || "",
        senderPhone: senderPhone || "",
        receiverName: receiverName || "",
        receiverPhone: receiverPhone || "",
        exactAddress: exactAddress || "",
        sector: sector || "Guayaquil",
        paymentMethod: checkoutState.paymentMethod,
        deliveryDateTime: deliveryDateTime || "",
        cardMessage: cardMessage || "",
        observations: observations || "",
        couponCode: checkoutState.appliedCoupon?.code || "",
        abandonedAt: new Date().toISOString(),
        abandonmentSessionId: abandonmentSessionId.current,
        source: `CHECKOUT_WEB_${checkoutStep.toUpperCase()}`,
        checkoutStep,
        checkoutStepLabel: CHECKOUT_STEP_LABELS[checkoutStep],
        items: checkoutState.items,
        total:
          checkoutState.cartTotal +
          checkoutState.shippingCost -
          (checkoutState.appliedCoupon
            ? checkoutState.appliedCoupon.type === "PERCENTAGE"
              ? checkoutState.cartTotal * checkoutState.appliedCoupon.percent_value
              : checkoutState.appliedCoupon.amount || 0
            : 0),
      }),
      keepalive: true,
    });
    abandonmentSent.current = true;
  }, []);

  useEffect(() => {
    const timer = setTimeout(handleAbandonment, 120000);
    window.addEventListener("beforeunload", handleAbandonment);
    window.addEventListener("pagehide", handleAbandonment);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleAbandonment);
      window.removeEventListener("pagehide", handleAbandonment);
      handleAbandonment();
    };
  }, [handleAbandonment]);

  const cartSubtotal = cartTotal;
  const shippingCost = shippingResolution.cost;
  const activeStepIndex = CHECKOUT_STEPS.findIndex(
    (step) => step.id === activeStep
  );

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = cartSubtotal * appliedCoupon.percent_value;
    } else if (appliedCoupon.amount) {
      discountAmount = appliedCoupon.amount;
    }
  }

  const finalTotal = cartSubtotal + shippingCost - discountAmount;
  const isCheckoutBusy = isStepLoading || orderStatus === "loading";

  const focusCheckoutField = (
    step: CheckoutStep,
    fieldRef: React.RefObject<CheckoutFocusable | null>
  ) => {
    setActiveStep(step);
    window.setTimeout(() => {
      fieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      fieldRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  const getMissingSenderFields = () => {
    const { senderName, senderEmail, senderPhone } = readCheckoutFields();
    return [
      [senderName, "nombre de quien envía"],
      [senderEmail, "correo de quien envía"],
      [senderPhone, "teléfono de quien envía"],
    ]
      .filter(([value]) => !value)
      .map(([, label]) => label);
  };

  const getMissingReceiverFields = () => {
    const {
      receiverName,
      receiverPhone,
      address,
      sector,
      cardMessage,
      deliveryDateTime,
    } = readCheckoutFields();
    return [
      [receiverName, "nombre de quien recibe"],
      [receiverPhone, "teléfono de quien recibe"],
      [sector, "sector"],
      [deliveryDateTime, "hora de entrega"],
      [address, "dirección exacta"],
      [cardMessage, "mensaje para la tarjeta"],
    ]
      .filter(([value]) => !value)
      .map(([, label]) => label);
  };

  const validateSenderStep = () => {
    const { senderName, senderEmail, senderPhone } = readCheckoutFields();
    const missingFields = getMissingSenderFields();

    if (missingFields.length > 0) {
      setErrorMsg(`Completa: ${missingFields.join(", ")}.`);
      if (!senderName) {
        focusCheckoutField("sender", senderNameRef);
      } else if (!senderEmail) {
        focusCheckoutField("sender", senderEmailRef);
      } else if (!senderPhone) {
        focusCheckoutField("sender", senderPhoneRef);
      }
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setErrorMsg("Ingresa un correo válido para quien envía.");
      focusCheckoutField("sender", senderEmailRef);
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const validateReceiverStep = () => {
    const {
      receiverName,
      receiverPhone,
      address,
      sector,
      cardMessage,
      deliveryDateTime,
    } = readCheckoutFields();
    const missingFields = getMissingReceiverFields();

    if (missingFields.length > 0) {
      setErrorMsg(`Completa: ${missingFields.join(", ")}.`);
      if (!receiverName) {
        focusCheckoutField("receiver", receiverNameRef);
      } else if (!receiverPhone) {
        focusCheckoutField("receiver", receiverPhoneRef);
      } else if (!sector) {
        focusCheckoutField("receiver", sectorRef);
      } else if (!deliveryDateTime) {
        focusCheckoutField("receiver", dateTimeRef);
      } else if (!address) {
        focusCheckoutField("receiver", addressRef);
      } else if (!cardMessage) {
        focusCheckoutField("receiver", cardMessageRef);
      }
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleNextStep = () => {
    if (isCheckoutBusy) return;

    if (activeStep === "sender") {
      if (validateSenderStep()) {
        setIsStepLoading(true);
        window.setTimeout(() => {
          setActiveStep("receiver");
          setIsStepLoading(false);
        }, 250);
      }
      return;
    }

    if (activeStep === "receiver") {
      if (validateReceiverStep()) {
        setIsStepLoading(true);
        window.setTimeout(() => {
          setActiveStep("payment");
          setIsStepLoading(false);
        }, 250);
      }
    }
  };

  const handlePreviousStep = () => {
    if (isCheckoutBusy) return;

    setIsStepLoading(true);
    window.setTimeout(() => {
      if (activeStep === "receiver") setActiveStep("sender");
      if (activeStep === "payment") setActiveStep("receiver");
      setIsStepLoading(false);
    }, 200);
    setErrorMsg("");
  };

  const handleOpenCart = () => {
    if (isCartOpening || isCheckoutBusy) return;
    setIsCartOpening(true);
    window.setTimeout(() => {
      setIsCartOpen(true);
      setIsCartOpening(false);
    }, 180);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/checkout/get-coupon-discount?code=${couponCode}`
      );
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const coupon = data.data;
        if (coupon.minAmount && cartSubtotal < coupon.minAmount) {
          setErrorMsg(
            `El cupón requiere una compra mínima de $${coupon.minAmount}`
          );
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
        }
      } else {
        setErrorMsg(data.message || "Cupón no válido");
        setAppliedCoupon(null);
      }
    } catch {
      setErrorMsg("Error al validar el cupón");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (isCheckoutBusy) return;

    const {
      senderName,
      senderEmail,
      senderPhone,
      receiverName,
      receiverPhone,
      deliveryDateTime,
      address,
      exactAddress,
      sector,
      cardMessage,
      observations,
    } = readCheckoutFields();

    if (!validateSenderStep() || !validateReceiverStep()) return;

    setErrorMsg("");
    setOrderStatus("loading");
    abandonmentSent.current = true;

    const firstItem = items[0];
    const orderPayload = {
      productId: firstItem?.product.id,
      productName: firstItem?.product.name,
      productPrice: firstItem?.product.price,
      quantity: firstItem?.quantity || 1,
      receiverName,
      senderName,
      senderEmail,
      senderPhone,
      receiverPhone,
      phone: senderPhone,
      deliveryDateTime,
      exactAddress,
      sector,
      shippingCost,
      cardMessage,
      observations,
      total: finalTotal,
      couponCode: appliedCoupon?.code || null,
    };

    try {
      if (paymentMethod === "Payphone") {
        localStorage.setItem(
          payphoneBoxStorageKey,
          JSON.stringify({
            ...orderPayload,
            callbackUrl: `${window.location.origin}/payment-result`,
            cancellationUrl: `${window.location.origin}/checkout`,
          })
        );
        setLocation("/payment-gateway");
        return;
      }

      if (paymentMethod === "PayPal") {
        const response = await fetch("/api/external/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            paymentMethod,
            callbackUrl: `${window.location.origin}/payment-result?provider=paypal`,
            cancellationUrl: `${window.location.origin}/payment-result?provider=paypal`,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(
            result.message ||
              "No se pudo iniciar el pago con PayPal. Intenta nuevamente."
          );
        }

        const createdOrderNumber = result.data?.orderNumber || "DIFIORI-OK";
        const approveUrl = String(result.data?.approveUrl || "").trim();

        setOrderNumber(createdOrderNumber);

        if (selectedProofFile) {
          await uploadPaymentProofForOrder(createdOrderNumber, selectedProofFile);
        }

        if (!approveUrl) {
          throw new Error("PayPal no devolvio una URL de aprobacion.");
        }

        window.location.assign(approveUrl);
        return;
      }

      const res = await fetch("/api/external/store-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, paymentMethod }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        const createdOrderNumber = data.data?.orderNumber || "DIFIORI-OK";
        setOrderNumber(createdOrderNumber);
        setOrderStatus("success");
        if (
          (paymentMethod === "Banco" ||
            paymentMethod === "Zelle" ||
            paymentMethod === "PayPal") &&
          selectedProofFile
        ) {
          await uploadPaymentProofForOrder(
            createdOrderNumber,
            selectedProofFile
          );
        }
        clearCart();
      } else {
        setErrorMsg(
          data.message ||
            "Hubo un error al procesar tu orden. Contáctanos por WhatsApp."
        );
        setOrderStatus("error");
        abandonmentSent.current = false;
      }
    } catch {
      setErrorMsg(
        "No se pudo conectar con el servidor. Contáctanos por WhatsApp."
      );
      setOrderStatus("error");
      abandonmentSent.current = false;
    }
  };

  const uploadPaymentProofForOrder = async (
    targetOrderNumber: string,
    proofFile: File
  ) => {
    if (!targetOrderNumber || !proofFile) {
      setProofMessage("Selecciona una imagen del comprobante antes de subir.");
      return;
    }

    setIsUploadingProof(true);
    setProofMessage("");

    try {
      const dataUrl = await readFileAsDataUrl(proofFile);
      const response = await fetch(
        `/api/external/store-orders/${encodeURIComponent(targetOrderNumber)}/payment-proof`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: proofFile.name,
            mimeType: proofFile.type,
            dataUrl,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "No se pudo subir el comprobante");
      }

      setProofMessage(
        "Comprobante subido. El equipo lo revisará desde el admin."
      );
      setSelectedProofFile(null);
    } catch (error) {
      setProofMessage(
        error instanceof Error
          ? error.message
          : "No se pudo subir el comprobante"
      );
    } finally {
      setIsUploadingProof(false);
    }
  };

  const uploadPaymentProof = async () => {
    if (!orderNumber || !selectedProofFile) {
      setProofMessage("Selecciona una imagen del comprobante antes de subir.");
      return;
    }

    await uploadPaymentProofForOrder(orderNumber, selectedProofFile);
  };

  if (isCartLoading) {
    return (
      <div className="checkout-shell flex min-h-screen items-center justify-center bg-white px-6">
        <Seo
          title="Cargando carrito | DIFIORI"
          description="Cargando el carrito antes de continuar con el checkout."
          path="/checkout"
          robots="noindex, nofollow"
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="checkout-panel flex w-full max-w-md flex-col items-center rounded-[2rem] p-10 text-center"
        >
          <Loader2 className="mb-5 h-12 w-12 animate-spin text-[#4A3362]" />
          <h1 className="font-serif text-3xl font-black text-[#4A3362]">
            Carrito cargando...
          </h1>
          <p className="mt-3 text-sm font-black text-[#4A3362]">
            Estamos preparando tu pedido para continuar con el pago.
          </p>
        </motion.div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <Seo
          title="Checkout | DIFIORI"
          description="Proceso de checkout de DIFIORI."
          path="/checkout"
          robots="noindex, nofollow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-2xl border border-[#E5D7EF] text-center max-w-lg w-full sm:p-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-serif font-black text-[#4A3362] mb-3">
            ¡Orden confirmada!
          </h2>
          <p className="text-[#4A3362] font-black text-lg mb-2">
            {orderNumber}
          </p>
          <p className="text-[#4A3362] text-base font-black mb-8">
            Hemos recibido tu pedido. El vendedor se pondrá en contacto contigo.
            Esperamos tu respuesta.
          </p>
          <Link href="/">
            <button className="w-full bg-[#4B1F6F] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver a la tienda
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-shell min-h-screen bg-white px-3 pb-20 pt-8 sm:px-6 sm:pt-16">
      <Seo
        title="Checkout | DIFIORI"
        description="Proceso de checkout de DIFIORI."
        path="/checkout"
        robots="noindex, nofollow"
      />
      <CartDialog />
      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-10">
          <Link
            href="/#catalogo"
            onClick={handleAbandonment}
            className="group mb-5 inline-flex items-center gap-2 font-black text-[#4A3362] transition-colors hover:text-[#4A3362]"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:translate-x-[-5px]" />
            Seguir comprando
          </Link>

          <h1 className="text-3xl font-serif font-black text-[#4A3362] sm:text-5xl">
            Finaliza tu pedido
          </h1>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-[1.25rem] border border-[#E5D7EF] bg-white p-1.5 shadow-[0_12px_32px_rgba(74,51,98,0.08)] sm:mb-8 sm:gap-2 sm:rounded-[1.5rem] sm:p-2">
          {CHECKOUT_STEPS.map((step, index) => {
            const isActive = step.id === activeStep;
            const isComplete = index < activeStepIndex;
            const StepIcon = step.Icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setActiveStep(step.id);
                  setErrorMsg("");
                }}
                className={cn(
                  "flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[1rem] px-1.5 text-center transition-all sm:min-h-[78px] sm:flex-row sm:gap-3 sm:px-2 sm:text-left",
                  isActive
                    ? "bg-[#4B1F6F] text-white shadow-lg shadow-[#4B1F6F]/20"
                    : "bg-white text-[#4A3362] hover:bg-[#FBF7FD]"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-black sm:h-10 sm:w-10 sm:text-base",
                    isActive
                      ? "border-white/40 bg-white/15 text-white"
                      : isComplete
                        ? "border-[#4B1F6F] bg-[#4B1F6F] text-white"
                        : "border-[#DCC5E8] bg-[#FBF7FD] text-[#4A3362]"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </span>
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-black leading-tight sm:text-lg">
                      {step.label}
                    </span>
                  <span
                    className={cn(
                      "hidden text-sm font-bold sm:block",
                      isActive ? "text-white/75" : "text-[#4A3362]"
                    )}
                  >
                    {step.helper}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start xl:grid-cols-[minmax(0,1fr)_490px]">
          <aside className="order-2 checkout-panel rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-7 lg:sticky lg:top-8 lg:order-2">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#4B1F6F] sm:gap-3 sm:text-5xl" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <ShoppingBag className="h-7 w-7 text-[#4B1F6F] sm:h-9 sm:w-9" /> Resumen
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenCart}
                    disabled={isCartOpening || isCheckoutBusy}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#4B1F6F] bg-[#4B1F6F] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-[#4B1F6F]/20 transition-all hover:bg-[#4A3362] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-widest"
                  >
                    {isCartOpening ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {isCartOpening ? "Abriendo..." : "Ver / cambiar"}
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {items.length === 0 ? (
                    <p className="rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] px-5 py-4 text-base font-black text-[#4A3362]">
                      Tu carrito esta vacio.
                    </p>
                  ) : (
                    items.map((item, i) => (
                      <div
                        key={i}
                        className="flex min-w-full items-center gap-3 rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] p-3 sm:gap-5 sm:p-4"
                      >
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-[#DCC5E8] bg-white sm:h-28 sm:w-24">
                          <img
                            src={item.product.image}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="whitespace-normal break-words text-base font-black leading-tight text-[#4B1F6F] sm:text-[1.55rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                            {item.product.name}
                          </h4>
                          <p className="mt-1 text-lg font-black text-[#4B1F6F] sm:mt-1.5 sm:text-[1.7rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                            {item.product.price}
                          </p>
                          <p className="mt-1 text-[0.72rem] font-black uppercase tracking-[0.12em] text-[#4B1F6F] sm:mt-1.5 sm:text-[1.32rem] sm:tracking-[0.16em]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                            Cant: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] p-4 sm:p-5">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#4A3362]">
                    Cupón
                  </label>
                  <div className="flex flex-col gap-2 min-[380px]:flex-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="CODIGO"
                      disabled={!!appliedCoupon}
                      className="checkout-input min-w-0 flex-1 px-4 py-3 text-base font-bold uppercase"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black text-red-500"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={isValidatingCoupon || !couponCode}
                        className="rounded-xl bg-[#4B1F6F] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#4B1F6F]/20 disabled:opacity-50"
                      >
                        {isValidatingCoupon ? "..." : "Aplicar"}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="mt-2 text-[10px] font-bold uppercase text-green-600">
                      Cupón aplicado
                    </p>
                  )}
                </div>

                <div className="space-y-3.5 border-t border-[#DCC5E8] pt-5">
                  <div className="flex items-start justify-between gap-3 text-base font-black text-[#4B1F6F] sm:text-[1.42rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-base font-black text-[#4B1F6F] sm:text-[1.42rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span>Sector</span>
                    <span className="min-w-0 max-w-[58%] break-words text-right text-[#4B1F6F]">
                      {sectorInput || "Pendiente"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-base font-black text-[#4B1F6F] sm:text-[1.42rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span>Envío</span>
                    <span className="min-w-0 max-w-[58%] break-words text-right text-[#4B1F6F]">
                      {shippingResolution.isMatched
                        ? `+$${shippingCost.toFixed(2)}`
                        : sectorInput
                          ? "A coordinar"
                          : "Ingresa tu sector"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 text-base font-black text-[#4B1F6F] sm:text-[1.42rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span>Pago</span>
                    <span className="text-[#4B1F6F]">{paymentMethod}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[1rem] font-bold text-green-600">
                      <span>Descuento</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-end justify-between gap-3 border-t border-[#DCC5E8] pt-4 text-3xl font-black text-[#4B1F6F] sm:text-[2.65rem]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <span className="font-serif">Total</span>
                    <span className="min-w-0 break-words text-right text-[#4B1F6F]">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                  {shippingResolution.isMatched && (
                    <p className="text-right text-[0.82rem] font-black text-[#4A3362]">
                      Total con envío adicional de ${shippingCost.toFixed(2)} para {shippingResolution.matchedSector}.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={
                    activeStep === "payment"
                      ? handleConfirmOrder
                      : handleNextStep
                  }
                  disabled={items.length === 0 || isCheckoutBusy}
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#4B1F6F] px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-[#4B1F6F]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-5 sm:text-base sm:tracking-widest lg:hidden"
                >
                  {isCheckoutBusy ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {orderStatus === "loading" ? "Procesando..." : "Cargando..."}
                    </>
                  ) : activeStep === "sender" ? (
                    "Continuar a entrega"
                  ) : activeStep === "receiver" ? (
                    "Continuar a pago"
                  ) : (
                    `Confirmar pedido $${finalTotal.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          </aside>

          <div className="order-1 space-y-8 lg:order-1">
            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-500"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-5 sm:space-y-8">
              <div
                className={cn(
                  "checkout-panel space-y-5 rounded-[1.5rem] p-4 sm:space-y-7 sm:rounded-[2rem] sm:p-10",
                  activeStep !== "sender" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-2 font-sans text-2xl font-black tracking-tight text-[#4B0082] sm:gap-3 sm:text-4xl">
                  <User className="h-7 w-7 sm:h-9 sm:w-9" /> Quién envía
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <label className="checkout-field">
                    <span>
                      <User className="h-5 w-5" /> Nombre *
                    </span>
                    <input
                      ref={senderNameRef}
                      autoComplete="name"
                      className="checkout-input"
                      placeholder="Nombre completo"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Mail className="h-5 w-5" /> Correo electrónico *
                    </span>
                    <input
                      ref={senderEmailRef}
                      type="email"
                      autoComplete="email"
                      className="checkout-input"
                      placeholder="correo@ejemplo.com"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Phone className="h-5 w-5" /> Teléfono *
                    </span>
                    <input
                      ref={senderPhoneRef}
                      type="tel"
                      autoComplete="tel"
                      className="checkout-input"
                      placeholder="Numero para confirmar el pedido"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isCheckoutBusy}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#4B1F6F] px-4 py-4 text-base font-black text-white shadow-lg shadow-[#4B1F6F]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:py-5 sm:text-lg"
                >
                  {isStepLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      Datos de quien recibe <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div
                className={cn(
                  "checkout-panel space-y-5 rounded-[1.5rem] p-4 sm:space-y-7 sm:rounded-[2rem] sm:p-10",
                  activeStep !== "receiver" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-2 font-sans text-2xl font-black tracking-tight text-[#4B0082] sm:gap-3 sm:text-4xl">
                  <Truck className="h-7 w-7 sm:h-9 sm:w-9" /> Quién recibe
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <label className="checkout-field">
                    <span>
                      <User className="h-5 w-5" /> Nombre de la persona *
                    </span>
                    <input
                      ref={receiverNameRef}
                      className="checkout-input"
                      placeholder="Nombre de quien recibe"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Phone className="h-5 w-5" /> Teléfono *
                    </span>
                    <input
                      ref={receiverPhoneRef}
                      type="tel"
                      className="checkout-input"
                      placeholder="Telefono de quien recibe"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <MapPin className="h-5 w-5" /> Sector *
                    </span>
                    <input
                      ref={sectorRef}
                      value={sectorInput}
                      onChange={(e) => setSectorInput(e.target.value)}
                      className="checkout-input"
                      placeholder="Ej: Urdesa, Alborada, Ceibos"
                      list="shipping-sector-options"
                    />
                    <datalist id="shipping-sector-options">
                      {shippingSectorRates.map((item) => (
                        <option key={item.sector} value={item.sector} />
                      ))}
                    </datalist>
                    {sectorSuggestions.length > 0 && !shippingResolution.isMatched ? (
                      <div className="overflow-hidden rounded-2xl border border-[#E5D7EF] bg-white shadow-sm">
                        {sectorSuggestions.map((item) => (
                          <button
                            key={item.sector}
                            type="button"
                            onClick={() => setSectorInput(item.sector)}
                    className="flex w-full items-center justify-between border-b border-[#F0E6F7] px-4 py-3 text-left text-base font-black text-[#4A3362] transition-colors hover:bg-[#FBF7FD] last:border-b-0"
                          >
                            <span>{item.sector}</span>
                            <span className="text-[0.78rem] font-black uppercase tracking-[0.12em] text-[#4A3362]">
                              sugerido
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <span className="text-sm font-black text-[#4A3362]">
                      {shippingResolution.isMatched
                        ? `Costo de envío para ${shippingResolution.matchedSector}: $${shippingCost.toFixed(2)}`
                        : sectorInput
                          ? "No encontramos una tarifa exacta para ese sector. El envío quedará a coordinar."
                          : "Ingresa tu sector para calcular el envío."}
                    </span>
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Clock className="h-5 w-5" /> Hora de entrega *
                    </span>
                    <input
                      ref={dateTimeRef}
                      className="checkout-input"
                      placeholder="Ej: hoy de 15:00 a 17:00"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <MapPin className="h-5 w-5" /> Dirección exacta *
                    </span>
                    <input
                      ref={addressRef}
                      className="checkout-input"
                      placeholder="Ciudadela, calle, manzana, villa, referencia"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <MessageSquare className="h-5 w-5" /> Mensaje para la tarjeta *
                    </span>
                    <textarea
                      ref={cardMessageRef}
                      className="checkout-input h-28 resize-none"
                      placeholder="Escribe el mensaje que irá en la tarjeta"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <FileText className="h-5 w-5" /> Observaciones
                    </span>
                    <textarea
                      ref={observationsRef}
                      className="checkout-input h-24 resize-none"
                      placeholder="Referencias, indicaciones o detalles especiales"
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={isCheckoutBusy}
                    className="rounded-2xl border border-[#DCC5E8] bg-white px-4 py-4 text-base font-black text-[#4A3362] transition-all hover:bg-[#FBF7FD] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-5 sm:text-lg"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isCheckoutBusy}
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#4B1F6F] px-4 py-4 text-base font-black text-white shadow-lg shadow-[#4B1F6F]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6 sm:py-5 sm:text-lg"
                  >
                    {isStepLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        Continuar a pago <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div
                className={cn(
                  "checkout-panel space-y-5 rounded-[1.5rem] p-4 sm:space-y-8 sm:rounded-[2rem] sm:p-10",
                  activeStep !== "payment" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-2 font-sans text-2xl font-black tracking-tight text-[#4B0082] sm:gap-3 sm:text-4xl">
                  <CreditCard className="h-7 w-7 sm:h-9 sm:w-9" /> Métodos de pago
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PAYMENT_METHODS.map(({ label, description, Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setPaymentMethod(label)}
                      disabled={isCheckoutBusy}
                      className={cn(
                        "flex min-h-[132px] flex-col items-start justify-between rounded-2xl border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
                        paymentMethod === label
                          ? "border-[#4B1F6F] bg-[#4B1F6F] text-white shadow-lg shadow-[#4B1F6F]/20"
                          : "border-[#DCC5E8] bg-white text-[#4A3362] hover:border-[#B58CCC] hover:bg-[#FBF7FD]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-7 w-7",
                          paymentMethod === label
                            ? "text-white"
                            : "text-[#4A3362]"
                        )}
                      />
                      <span className="text-2xl font-black">{label}</span>
                      <span
                        className={cn(
                          "text-base font-black leading-snug",
                          paymentMethod === label
                            ? "text-white/80"
                            : "text-[#4A3362]"
                        )}
                      >
                        {description}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={paymentMethod}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="checkout-subpanel rounded-2xl border border-dashed border-[#B58CCC] p-6"
                  >
                    {paymentMethod === "Banco" && (
                      <>
                        <p className="mb-4 text-base font-black text-[#4A3362]">
                          Datos para transferencia bancaria:
                        </p>
                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[#4A3362]">
                          {transferInstructions}
                        </pre>
                        <p className="mt-4 text-base font-black text-[#4A3362]">
                          Puedes adjuntar el comprobante aquí. Cuando confirmes el pedido se subirá automáticamente y el admin lo verá en la orden.
                        </p>
                      </>
                    )}
                    {paymentMethod === "Payphone" && (
                      <div className="flex items-start gap-4">
                        <Smartphone className="mt-1 h-7 w-7 text-[#4A3362]" />
                        <div>
                          <p className="text-lg font-black text-[#4A3362]">
                            Pago seguro con Payphone
                          </p>
                          <p className="mt-1 text-base font-black text-[#4A3362]">
                            Al confirmar serás redirigido a la pasarela para ingresar los datos de tu tarjeta.
                          </p>
                        </div>
                      </div>
                    )}
                    {paymentMethod === "PayPal" && (
                      <div className="flex items-start gap-4">
                        <Globe2 className="mt-1 h-7 w-7 text-[#4A3362]" />
                        <div>
                          <p className="text-lg font-black text-[#4A3362]">
                            Pago internacional o con tarjeta de crédito
                          </p>
                          <p className="mt-1 text-base font-black text-[#4A3362]">
                            Al confirmar te redirigiremos a PayPal para completar el pago de forma segura.
                          </p>
                        </div>
                      </div>
                    )}
                    {paymentMethod === "Zelle" && (
                      <div className="flex items-start gap-4">
                        <CreditCard className="mt-1 h-7 w-7 text-[#4A3362]" />
                        <div>
                          <p className="text-lg font-black text-[#4A3362]">
                            Pago por Zelle
                          </p>
                          <pre className="mt-2 whitespace-pre-wrap font-sans text-base leading-relaxed text-[#4A3362]">
                            {DEFAULT_ZELLE_INSTRUCTIONS}
                          </pre>
                          <p className="mt-3 text-base font-black text-[#4A3362]">
                            Si ya hiciste el pago, adjunta aquí tu comprobante para subirlo automáticamente al confirmar el pedido.
                          </p>
                        </div>
                      </div>
                    )}
                    {(paymentMethod === "Banco" ||
                      paymentMethod === "Zelle" ||
                      paymentMethod === "PayPal") && (
                      <div className="mt-6 rounded-2xl border border-[#DCC5E8] bg-white p-4">
                        <p className="text-base font-black text-[#4A3362]">
                          Comprobante de pago
                        </p>
                        <p className="mt-1 text-sm font-black text-[#4A3362]">
                          Selecciona la imagen del comprobante. Al confirmar el pedido se guardará automáticamente para que el admin pueda verlo.
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setSelectedProofFile(e.target.files?.[0] || null);
                            setProofMessage("");
                          }}
                          className="mt-4 block w-full text-sm text-[#4A3362] file:mr-3 file:rounded-xl file:border-0 file:bg-[#4B1F6F] file:px-4 file:py-2 file:text-white"
                        />
                        <p className="mt-3 text-sm font-black text-[#4A3362]">
                          {selectedProofFile
                            ? `Archivo listo: ${selectedProofFile.name}`
                            : "Aún no has seleccionado un comprobante."}
                        </p>
                        {proofMessage && (
                          <p className="mt-2 text-sm text-[#4A3362]">
                            {proofMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={isCheckoutBusy}
                    className="rounded-2xl border border-[#DCC5E8] bg-white px-4 py-4 text-base font-black text-[#4A3362] transition-all hover:bg-[#FBF7FD] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-5 sm:text-lg"
                  >
                    Volver a entrega
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={items.length === 0 || isCheckoutBusy}
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#4B1F6F] px-4 py-4 text-base font-black text-white shadow-lg shadow-[#4B1F6F]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-5 sm:text-lg"
                  >
                    {orderStatus === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      `Confirmar pedido $${finalTotal.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}
