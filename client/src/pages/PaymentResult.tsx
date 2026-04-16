import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type ResultStatus = "loading" | "success" | "failed" | "cancelled" | "error";

export default function PaymentResult() {
  const [status, setStatus] = useState<ResultStatus>("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    const params = new URLSearchParams(window.location.search);
    const payphoneId = params.get("id");
    const clientTransactionId = params.get("clientTransactionId");
    const transactionStatus = params.get("transactionStatus");

    // Si no hay clientTransactionId en la URL, buscar en localStorage (fallback)
    const finalClientTxId = clientTransactionId || localStorage.getItem("pp_clientTxId");

    if (!finalClientTxId) {
      setStatus("error");
      return;
    }

    fetch("/api/external/payphone/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: payphoneId,
        clientTransactionId: finalClientTxId,
        transactionStatus,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") {
          const ps = data.data?.paymentStatus;
          setOrderNumber(data.data?.orderNumber || "");
          if (ps === "PAID") {
            setStatus("success");
            localStorage.removeItem("pp_clientTxId");
          } else if (ps === "CANCELLED") {
            setStatus("cancelled");
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#3D2852] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-[#5A3F73]" />
          <p className="font-bold text-lg">Confirmando tu pago...</p>
          <p className="text-[#E6E6E6]/40 text-sm mt-2">Por favor no cierres esta ventana</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#3D2852] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#2A1B38]/80 backdrop-blur-3xl p-14 rounded-[3rem] shadow-2xl border-2 border-[#5A3F73]/40 text-center max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-serif font-bold text-[#E6E6E6] mb-3">¡Pago Exitoso!</h2>
          {orderNumber && (
            <p className="text-[#5A3F73] font-black text-lg mb-2">{orderNumber}</p>
          )}
          <p className="text-[#E6E6E6]/60 text-sm mb-8">
            Tu pago fue procesado correctamente. Nuestro equipo se pondrá en contacto contigo para coordinar la entrega.
          </p>
          <Link href="/">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver a la tienda 🌸
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-screen bg-[#3D2852] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#2A1B38]/80 backdrop-blur-3xl p-14 rounded-[3rem] shadow-2xl border-2 border-[#5A3F73]/40 text-center max-w-lg w-full"
        >
          <XCircle className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-[#E6E6E6] mb-3">Pago cancelado</h2>
          <p className="text-[#E6E6E6]/60 text-sm mb-8">
            Cancelaste el proceso de pago. Tu pedido no fue completado.
          </p>
          <Link href="/checkout">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver al checkout
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // failed o error
  return (
    <div className="min-h-screen bg-[#3D2852] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#2A1B38]/80 backdrop-blur-3xl p-14 rounded-[3rem] shadow-2xl border-2 border-red-500/30 text-center max-w-lg w-full"
      >
        <XCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
        <h2 className="text-3xl font-serif font-bold text-[#E6E6E6] mb-3">
          {status === "failed" ? "Pago rechazado" : "Error en el pago"}
        </h2>
        <p className="text-[#E6E6E6]/60 text-sm mb-8">
          {status === "failed"
            ? "Tu tarjeta fue rechazada. Verifica los datos o intenta con otra tarjeta."
            : "Ocurrió un error al procesar el pago. Por favor contáctanos."}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Intentar de nuevo
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-transparent border border-[#5A3F73]/40 text-[#E6E6E6]/60 py-4 rounded-3xl font-bold text-sm transition-all hover:border-[#5A3F73]">
              Volver a la tienda
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
