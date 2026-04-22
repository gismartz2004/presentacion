import React, { useEffect, useMemo, useRef, useState } from "react";
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
    helper: "Quien envia",
    Icon: User,
  },
  {
    id: "receiver",
    label: "Entrega",
    helper: "Quien recibe",
    Icon: Truck,
  },
  {
    id: "payment",
    label: "Pago",
    helper: "Confirmacion",
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
    description: "Pago internacional o con tarjeta de credito",
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
    description: "Pago por Zelle; el vendedor confirmara los datos",
    Icon: CreditCard,
  },
];

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
  const { items, cartTotal, clearCart, setIsCartOpen } = useCart();
  const [, setLocation] = useLocation();
  const { data: company } = useCompany();
  const [activeStep, setActiveStep] = useState<CheckoutStep>("sender");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Banco");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
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
    "Banco: Banco del Pichincha\nCuenta: 2205748975\nTitular: DIFIORI";
  const shippingSectorRates = useMemo(
    () => normalizeSectorRates(company?.settings?.paymentSettings?.shippingSectorRates),
    [company?.settings?.paymentSettings?.shippingSectorRates]
  );
  const shippingResolution = useMemo(
    () => resolveShippingCostBySector(sectorInput, shippingSectorRates),
    [sectorInput, shippingSectorRates]
  );

  const receiverNameRef = useRef<HTMLInputElement>(null);
  const receiverPhoneRef = useRef<HTMLInputElement>(null);
  const senderNameRef = useRef<HTMLInputElement>(null);
  const senderEmailRef = useRef<HTMLInputElement>(null);
  const senderPhoneRef = useRef<HTMLInputElement>(null);
  const dateTimeRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cardMessageRef = useRef<HTMLTextAreaElement>(null);
  const observationsRef = useRef<HTMLTextAreaElement>(null);

  const abandonmentSent = useRef(false);

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
    const handleAbandonment = () => {
      if (
        abandonmentSent.current ||
        orderStatus === "success" ||
        items.length === 0
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

      if (senderName || senderPhone) {
        fetch("/api/external/store-orders/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: senderName || "Cliente anonimo",
            phone: senderPhone || "No proporcionado",
            senderName: senderName || "",
            senderEmail: senderEmail || "",
            senderPhone: senderPhone || "",
            receiverName: receiverName || "",
            receiverPhone: receiverPhone || "",
            exactAddress: exactAddress || "",
            sector: sector || "Guayaquil",
            paymentMethod,
            deliveryDateTime: deliveryDateTime || "",
            cardMessage: cardMessage || "",
            observations: observations || "",
            couponCode: appliedCoupon?.code || "",
            abandonedAt: new Date().toISOString(),
            source: "CHECKOUT_WEB",
            items,
            total:
              cartTotal +
              shippingResolution.cost -
              (appliedCoupon
                ? appliedCoupon.type === "PERCENTAGE"
                  ? cartTotal * appliedCoupon.percent_value
                  : appliedCoupon.amount || 0
                : 0),
          }),
          keepalive: true,
        });
        abandonmentSent.current = true;
      }
    };

    const timer = setTimeout(handleAbandonment, 120000);
    window.addEventListener("beforeunload", handleAbandonment);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleAbandonment);
    };
  }, [items, orderStatus, paymentMethod, appliedCoupon, cartTotal, shippingResolution.cost, sectorInput]);

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

  const getMissingSenderFields = () => {
    const { senderName, senderEmail, senderPhone } = readCheckoutFields();
    return [
      [senderName, "nombre de quien envia"],
      [senderEmail, "correo de quien envia"],
      [senderPhone, "telefono de quien envia"],
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
      [receiverPhone, "telefono de quien recibe"],
      [sector, "sector"],
      [address, "direccion exacta"],
      [cardMessage, "mensaje para la tarjeta"],
      [deliveryDateTime, "hora de entrega"],
    ]
      .filter(([value]) => !value)
      .map(([, label]) => label);
  };

  const validateSenderStep = () => {
    const { senderEmail } = readCheckoutFields();
    const missingFields = getMissingSenderFields();

    if (missingFields.length > 0) {
      setActiveStep("sender");
      setErrorMsg(`Completa: ${missingFields.join(", ")}.`);
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setActiveStep("sender");
      setErrorMsg("Ingresa un correo valido para quien envia.");
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const validateReceiverStep = () => {
    const missingFields = getMissingReceiverFields();

    if (missingFields.length > 0) {
      setActiveStep("receiver");
      setErrorMsg(`Completa: ${missingFields.join(", ")}.`);
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === "sender") {
      if (validateSenderStep()) setActiveStep("receiver");
      return;
    }

    if (activeStep === "receiver") {
      if (validateReceiverStep()) setActiveStep("payment");
    }
  };

  const handlePreviousStep = () => {
    if (activeStep === "receiver") setActiveStep("sender");
    if (activeStep === "payment") setActiveStep("receiver");
    setErrorMsg("");
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
            `El cupon requiere una compra minima de $${coupon.minAmount}`
          );
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
        }
      } else {
        setErrorMsg(data.message || "Cupon no valido");
        setAppliedCoupon(null);
      }
    } catch {
      setErrorMsg("Error al validar el cupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleConfirmOrder = async () => {
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

      const res = await fetch("/api/external/store-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, paymentMethod }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setOrderNumber(data.data?.orderNumber || "DIFIORI-OK");
        setOrderStatus("success");
        clearCart();
      } else {
        setErrorMsg(
          data.message ||
            "Hubo un error al procesar tu orden. Contactanos por WhatsApp."
        );
        setOrderStatus("error");
        abandonmentSent.current = false;
      }
    } catch {
      setErrorMsg(
        "No se pudo conectar con el servidor. Contactanos por WhatsApp."
      );
      setOrderStatus("error");
      abandonmentSent.current = false;
    }
  };

  const uploadPaymentProof = async () => {
    if (!orderNumber || !selectedProofFile) {
      setProofMessage("Selecciona una imagen del comprobante antes de subir.");
      return;
    }

    setIsUploadingProof(true);
    setProofMessage("");

    try {
      const dataUrl = await readFileAsDataUrl(selectedProofFile);
      const response = await fetch(
        `/api/external/store-orders/${encodeURIComponent(orderNumber)}/payment-proof`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedProofFile.name,
            mimeType: selectedProofFile.type,
            dataUrl,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "No se pudo subir el comprobante");
      }

      setProofMessage(
        "Comprobante subido. El equipo lo revisara desde el admin."
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
          <h2 className="text-3xl font-serif font-bold text-[#4A3362] mb-3">
            ¡Orden confirmada!
          </h2>
          <p className="text-[#5A3F73] font-black text-lg mb-2">
            {orderNumber}
          </p>
          <p className="text-[#5A3F73] text-base font-semibold mb-8">
            Hemos recibido tu pedido. El vendedor se pondra en contacto contigo.
            Esperamos tu respuesta.
          </p>
          {(paymentMethod === "Banco" || paymentMethod === "Zelle") && (
            <div className="bg-[#FBF7FD] border border-dashed border-[#B58CCC] rounded-2xl p-6 mb-8 text-left">
              <p className="text-[#4A3362] text-sm font-bold mb-2">
                {paymentMethod === "Banco" ? "Instrucciones de transferencia:" : "Pago por Zelle:"}
              </p>
              {paymentMethod === "Banco" ? (
                <pre className="whitespace-pre-wrap text-[#5A3F73] text-sm font-sans">
                  {transferInstructions}
                </pre>
              ) : (
                <p className="text-[#5A3F73] text-sm">
                  El vendedor confirmara los datos de Zelle y validara el pago con tu comprobante.
                </p>
              )}
              <p className="text-[#6B5487] text-xs mt-4 mb-2">
                Sube aqui tu comprobante para que aparezca en el panel admin:
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setSelectedProofFile(e.target.files?.[0] || null)
                }
                className="block w-full text-xs text-[#5A3F73] file:mr-3 file:rounded-xl file:border-0 file:bg-[#5A3F73] file:px-4 file:py-2 file:text-white"
              />
              <button
                onClick={uploadPaymentProof}
                disabled={!selectedProofFile || isUploadingProof}
                className="mt-4 w-full bg-[#5A3F73] hover:bg-[#4A3362] disabled:opacity-50 text-white py-3 rounded-2xl font-black text-sm transition-all"
              >
                {isUploadingProof
                  ? "Subiendo comprobante..."
                  : "Subir comprobante"}
              </button>
              {proofMessage && (
                <p className="text-[#5A3F73] text-xs mt-3">{proofMessage}</p>
              )}
            </div>
          )}
          <Link href="/">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver a la tienda
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-shell min-h-screen bg-white pt-16 pb-20 px-4 sm:px-6">
      <Seo
        title="Checkout | DIFIORI"
        description="Proceso de checkout de DIFIORI."
        path="/checkout"
        robots="noindex, nofollow"
      />
      <CartDialog />
      <div className="container relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link
            href="/#catalogo"
            className="group mb-5 inline-flex items-center gap-2 font-bold text-[#6B5487] transition-colors hover:text-[#4A3362]"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:translate-x-[-5px]" />
            Seguir comprando
          </Link>

          <h1 className="text-4xl font-serif font-bold text-[#4A3362] sm:text-5xl">
            Finaliza tu pedido
          </h1>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-2 rounded-[1.5rem] border border-[#E5D7EF] bg-white p-2 shadow-[0_12px_32px_rgba(74,51,98,0.08)]">
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
                  "flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-center transition-all sm:flex-row sm:gap-3 sm:text-left",
                  isActive
                    ? "bg-[#5A3F73] text-white shadow-lg shadow-[#5A3F73]/20"
                    : "bg-white text-[#6B5487] hover:bg-[#FBF7FD]"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black",
                    isActive
                      ? "border-white/40 bg-white/15 text-white"
                      : isComplete
                        ? "border-[#5A3F73] bg-[#5A3F73] text-white"
                        : "border-[#DCC5E8] bg-[#FBF7FD] text-[#5A3F73]"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black sm:text-base">
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-bold sm:block",
                      isActive ? "text-white/75" : "text-[#8D73A6]"
                    )}
                  >
                    {step.helper}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <aside className="order-2 checkout-panel rounded-[2rem] p-6 lg:sticky lg:order-2">
            <div className="space-y-6">
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="flex items-center gap-3 text-2xl font-serif font-bold uppercase tracking-wide text-[#4A3362] underline decoration-[#CDAFDE] decoration-4 underline-offset-4">
                    <ShoppingBag className="h-6 w-6" /> Resumen
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="shrink-0 rounded-full border border-[#DCC5E8] bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-[#5A3F73] transition-all hover:bg-[#FBF7FD]"
                  >
                    Ver / cambiar
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {items.length === 0 ? (
                    <p className="rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] px-5 py-4 text-sm font-semibold text-[#6B5487]">
                      Tu carrito esta vacio.
                    </p>
                  ) : (
                    items.map((item, i) => (
                      <div
                        key={i}
                        className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] p-3"
                      >
                        <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-[#DCC5E8] bg-white">
                          <img
                            src={item.product.image}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-black text-[#4A3362]">
                            {item.product.name}
                          </h4>
                          <p className="mt-1 text-sm font-black text-[#5A3F73]">
                            {item.product.price}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8D73A6]">
                            Cant: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5D7EF] bg-[#FBF7FD] p-4">
                <div className="mb-4">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#6B5487]">
                    Cupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="CODIGO"
                      disabled={!!appliedCoupon}
                      className="checkout-input flex-1 px-4 py-3 text-xs font-bold uppercase"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black text-red-500"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={isValidatingCoupon || !couponCode}
                        className="rounded-xl bg-[#5A3F73] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[#5A3F73]/20 disabled:opacity-50"
                      >
                        {isValidatingCoupon ? "..." : "Aplicar"}
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="mt-2 text-[10px] font-bold uppercase text-green-600">
                      Cupon aplicado
                    </p>
                  )}
                </div>

                <div className="space-y-3 border-t border-[#DCC5E8] pt-4">
                  <div className="flex justify-between text-sm font-semibold text-[#6B5487]">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#6B5487]">
                    <span>Sector</span>
                    <span className="text-[#5A3F73]">
                      {sectorInput || "Pendiente"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#6B5487]">
                    <span>Envio</span>
                    <span className="text-[#5A3F73]">
                      {shippingResolution.isMatched
                        ? `+$${shippingCost.toFixed(2)}`
                        : sectorInput
                          ? "A coordinar"
                          : "Ingresa tu sector"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-[#6B5487]">
                    <span>Pago</span>
                    <span className="text-[#5A3F73]">{paymentMethod}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                      <span>Descuento</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#DCC5E8] pt-3 text-2xl font-black text-[#4A3362]">
                    <span className="font-serif">Total</span>
                    <span className="text-[#5A3F73]">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                  {shippingResolution.isMatched && (
                    <p className="text-right text-[11px] font-semibold text-[#6B5487]">
                      Total con envio adicional de ${shippingCost.toFixed(2)} para {shippingResolution.matchedSector}.
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
                  disabled={items.length === 0 || orderStatus === "loading"}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#5A3F73] px-6 py-5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#5A3F73]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                >
                  {orderStatus === "loading" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando...
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

            <div className="space-y-8">
              <div
                className={cn(
                  "checkout-panel rounded-[2rem] p-6 space-y-7 sm:p-10",
                  activeStep !== "sender" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-3 text-3xl font-bold text-[#4A3362]">
                  <User className="h-8 w-8" /> Quien envia
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="checkout-field">
                    <span>
                      <User className="h-4 w-4" /> Nombre *
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
                      <Mail className="h-4 w-4" /> Correo electronico *
                    </span>
                    <input
                      ref={senderEmailRef}
                      type="email"
                      autoComplete="email"
                      className="checkout-input"
                      placeholder="correo@ejemplo.com"
                    />
                  </label>
                  <label className="checkout-field md:col-span-2">
                    <span>
                      <Phone className="h-4 w-4" /> Telefono *
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
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#5A3F73] px-6 py-5 text-base font-black text-white shadow-lg shadow-[#5A3F73]/20 transition-all hover:bg-[#4A3362] active:scale-95 sm:w-auto"
                >
                  Continuar a entrega <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div
                className={cn(
                  "checkout-panel rounded-[2rem] p-6 space-y-7 sm:p-10",
                  activeStep !== "receiver" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-3 text-3xl font-bold text-[#4A3362]">
                  <Truck className="h-8 w-8" /> Quien recibe
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <label className="checkout-field">
                    <span>
                      <User className="h-4 w-4" /> Nombre de la persona *
                    </span>
                    <input
                      ref={receiverNameRef}
                      className="checkout-input"
                      placeholder="Nombre de quien recibe"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Phone className="h-4 w-4" /> Telefono *
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
                      <MapPin className="h-4 w-4" /> Sector *
                    </span>
                    <input
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
                    <span className="text-xs font-medium text-[#6B5487]">
                      {shippingResolution.isMatched
                        ? `Costo de envio para ${shippingResolution.matchedSector}: $${shippingCost.toFixed(2)}`
                        : sectorInput
                          ? "No encontramos una tarifa exacta para ese sector. El envio quedara a coordinar."
                          : "Ingresa tu sector para calcular el envio."}
                    </span>
                  </label>
                  <label className="checkout-field">
                    <span>
                      <Clock className="h-4 w-4" /> Hora de entrega *
                    </span>
                    <input
                      ref={dateTimeRef}
                      className="checkout-input"
                      placeholder="Ej: hoy de 15:00 a 17:00"
                    />
                  </label>
                  <label className="checkout-field md:col-span-2">
                    <span>
                      <MapPin className="h-4 w-4" /> Direccion exacta *
                    </span>
                    <input
                      ref={addressRef}
                      className="checkout-input"
                      placeholder="Ciudadela, calle, manzana, villa, referencia"
                    />
                  </label>
                  <label className="checkout-field md:col-span-2">
                    <span>
                      <MessageSquare className="h-4 w-4" /> Mensaje para la tarjeta *
                    </span>
                    <textarea
                      ref={cardMessageRef}
                      className="checkout-input h-28 resize-none"
                      placeholder="Escribe el mensaje que ira en la tarjeta"
                    />
                  </label>
                  <label className="checkout-field md:col-span-2">
                    <span>
                      <FileText className="h-4 w-4" /> Observaciones
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
                    className="rounded-2xl border border-[#DCC5E8] bg-white px-6 py-5 text-base font-black text-[#5A3F73] transition-all hover:bg-[#FBF7FD] active:scale-95"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#5A3F73] px-6 py-5 text-base font-black text-white shadow-lg shadow-[#5A3F73]/20 transition-all hover:bg-[#4A3362] active:scale-95 sm:flex-none"
                  >
                    Continuar a pago <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className={cn(
                  "checkout-panel rounded-[2rem] p-6 space-y-8 sm:p-10",
                  activeStep !== "payment" && "hidden"
                )}
              >
                <h3 className="flex items-center gap-3 text-3xl font-bold text-[#4A3362]">
                  <CreditCard className="h-8 w-8" /> Metodos de pago
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PAYMENT_METHODS.map(({ label, description, Icon }) => (
                    <button
                      key={label}
                      onClick={() => setPaymentMethod(label)}
                      className={cn(
                        "flex min-h-[132px] flex-col items-start justify-between rounded-2xl border p-5 text-left transition-all",
                        paymentMethod === label
                          ? "border-[#5A3F73] bg-[#5A3F73] text-white shadow-lg shadow-[#5A3F73]/20"
                          : "border-[#DCC5E8] bg-white text-[#4A3362] hover:border-[#B58CCC] hover:bg-[#FBF7FD]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-7 w-7",
                          paymentMethod === label
                            ? "text-white"
                            : "text-[#5A3F73]"
                        )}
                      />
                      <span className="text-xl font-black">{label}</span>
                      <span
                        className={cn(
                          "text-sm font-semibold leading-snug",
                          paymentMethod === label
                            ? "text-white/80"
                            : "text-[#6B5487]"
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
                        <p className="mb-4 text-base font-bold text-[#4A3362]">
                          Datos para transferencia bancaria:
                        </p>
                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[#5A3F73]">
                          {transferInstructions}
                        </pre>
                        <p className="mt-4 text-sm font-medium text-[#6B5487]">
                          Despues de confirmar podras subir el comprobante y quedara visible en el admin.
                        </p>
                      </>
                    )}
                    {paymentMethod === "Payphone" && (
                      <div className="flex items-start gap-4">
                        <Smartphone className="mt-1 h-7 w-7 text-[#5A3F73]" />
                        <div>
                          <p className="text-base font-bold text-[#4A3362]">
                            Pago seguro con Payphone
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#6B5487]">
                            Al confirmar seras redirigido a la pasarela para ingresar los datos de tu tarjeta.
                          </p>
                        </div>
                      </div>
                    )}
                    {paymentMethod === "PayPal" && (
                      <div className="flex items-start gap-4">
                        <Globe2 className="mt-1 h-7 w-7 text-[#5A3F73]" />
                        <div>
                          <p className="text-base font-bold text-[#4A3362]">
                            Pago internacional o con tarjeta de credito
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#6B5487]">
                            Registraremos tu pedido y el vendedor se pondra en contacto contigo para completar el pago.
                          </p>
                        </div>
                      </div>
                    )}
                    {paymentMethod === "Zelle" && (
                      <div className="flex items-start gap-4">
                        <CreditCard className="mt-1 h-7 w-7 text-[#5A3F73]" />
                        <div>
                          <p className="text-base font-bold text-[#4A3362]">
                            Pago por Zelle
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#6B5487]">
                            Registraremos tu pedido y el vendedor compartira o confirmara los datos de pago.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="rounded-2xl border border-[#DCC5E8] bg-white px-6 py-5 text-base font-black text-[#5A3F73] transition-all hover:bg-[#FBF7FD] active:scale-95"
                  >
                    Volver a entrega
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={items.length === 0 || orderStatus === "loading"}
                    className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-[#5A3F73] px-6 py-5 text-base font-black text-white shadow-lg shadow-[#5A3F73]/20 transition-all hover:bg-[#4A3362] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
