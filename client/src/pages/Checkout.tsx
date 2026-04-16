import React, { useState, useRef, useEffect } from "react";
import { ShoppingBag, ChevronLeft, CreditCard, Truck, User, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

import { CartDialog } from "@/components/CartDialog";

const SECTORS = [
  { name: "Norte (Urdesa, Alborada, Sauces)", price: 0 },
  { name: "Centro / Sur", price: 3 },
  { name: "Ceibos / Los Olivos", price: 4 },
  { name: "Vía a la Costa", price: 5 },
  { name: "Samborondón / Vía a Salitre", price: 5 },
  { name: "Durán", price: 6 }
];

type OrderStatus = "idle" | "loading" | "success" | "error";

export default function Checkout() {
  const { items, cartTotal, clearCart, updateQuantity, removeItem, isCartOpen, setIsCartOpen } = useCart();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [sector, setSector] = useState(SECTORS[0]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent_value: number;
    amount: number | null;
    type: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form refs
  const receiverNameRef = useRef<HTMLInputElement>(null);
  const senderNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateTimeRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cardMessageRef = useRef<HTMLTextAreaElement>(null);

  // --- Lógica de Carrito Abandonado ---
  const abandonmentSent = useRef(false);

  useEffect(() => {
    const handleAbandonment = () => {
      if (abandonmentSent.current || orderStatus === "success" || items.length === 0) return;

      const customerName = senderNameRef.current?.value;
      const phone = phoneRef.current?.value;

      // Si han ingresado al menos el nombre o el teléfono, disparamos la alerta
      if (customerName || phone) {
        fetch("/api/external/store-orders/abandoned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: customerName || "Cliente anónimo",
            phone: phone || "No proporcionado",
            items,
            total: finalTotal
          }),
          keepalive: true, // Importante para que la petición se complete al cerrar la pestaña
        });
        abandonmentSent.current = true;
      }
    };

    // Alerta tras 2 minutos de inactividad o al intentar cerrar
    const timer = setTimeout(handleAbandonment, 120000); 
    window.addEventListener("beforeunload", handleAbandonment);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleAbandonment);
    };
  }, [items, orderStatus]);
  // -------------------------------------

  const cartSubtotal = cartTotal;
  const shippingCost = sector.price;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = cartSubtotal * appliedCoupon.percent_value;
    } else if (appliedCoupon.amount) {
      discountAmount = appliedCoupon.amount;
    }
  }

  const finalTotal = cartSubtotal + shippingCost - discountAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/checkout/get-coupon-discount?code=${couponCode}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        const coupon = data.data;
        if (coupon.minAmount && cartSubtotal < coupon.minAmount) {
          setErrorMsg(`El cupón requiere una compra mínima de $${coupon.minAmount}`);
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
        }
      } else {
        setErrorMsg(data.message || "Cupón no válido");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setErrorMsg("Error al validar el cupón");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleConfirmOrder = async () => {
    const receiverName = receiverNameRef.current?.value || "";
    const senderName = senderNameRef.current?.value || "";
    const phone = phoneRef.current?.value || "";
    const deliveryDateTime = dateTimeRef.current?.value || "";
    const exactAddress = addressRef.current?.value || "";
    const cardMessage = cardMessageRef.current?.value || "";

    if (!receiverName || !senderName || !phone) {
      setErrorMsg("Por favor completa: nombre de quien recibe, quien envía y celular.");
      return;
    }

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
      phone,
      deliveryDateTime,
      exactAddress,
      sector: sector.name,
      shippingCost: sector.price,
      cardMessage,
      total: cartSubtotal + shippingCost,
      couponCode: appliedCoupon?.code || null,
    };

    try {
      // --- Pago con Tarjeta: redirigir a PayPhone ---
      if (paymentMethod === "Tarjeta") {
        const callbackBase = `${window.location.origin}/payment-result`;
        const res = await fetch("/api/external/payphone/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            callbackUrl: callbackBase,
            cancellationUrl: `${window.location.origin}/checkout`,
          }),
        });

        const data = await res.json();

        if (res.ok && data.status === "success") {
          // Guardar clientTransactionId en localStorage por si el redirect pierde params
          localStorage.setItem("pp_clientTxId", data.data.clientTransactionId);
          clearCart();
          window.location.href = data.data.paymentUrl;
        } else {
          setErrorMsg(data.message || "No se pudo iniciar el pago con tarjeta. Intenta con transferencia.");
          setOrderStatus("error");
          abandonmentSent.current = false;
        }
        return;
      }

      // --- Pago por Transferencia: flujo directo ---
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
        setErrorMsg(data.message || "Hubo un error al procesar tu orden. Contáctanos por WhatsApp.");
        setOrderStatus("error");
        abandonmentSent.current = false;
      }
    } catch {
      setErrorMsg("No se pudo conectar con el servidor. Contáctanos por WhatsApp.");
      setOrderStatus("error");
      abandonmentSent.current = false;
    }
  };

  // Pantalla de éxito
  if (orderStatus === "success") {
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
          <h2 className="text-3xl font-serif font-bold text-[#E6E6E6] mb-3">¡Orden Confirmada!</h2>
          <p className="text-[#5A3F73] font-black text-lg mb-2">{orderNumber}</p>
          <p className="text-[#E6E6E6]/60 text-sm mb-8">
            Hemos recibido tu pedido. Nuestro equipo se pondrá en contacto contigo pronto para coordinar la entrega.
          </p>
          {paymentMethod === "Transferencia" && (
            <div className="bg-[#5A3F73]/20 border border-dashed border-[#5A3F73] rounded-2xl p-6 mb-8 text-left">
              <p className="text-[#E6E6E6]/80 text-sm font-bold mb-2">📌 Recuerda realizar la transferencia:</p>
              <p className="text-[#E6E6E6]/60 text-xs">Banco: Banco del Pichincha</p>
              <p className="text-[#E6E6E6]/60 text-xs">Cta: 2205748975</p>
              <p className="text-[#E6E6E6]/60 text-xs">Titular: DIFIORI</p>
              <p className="text-[#E6E6E6]/60 text-xs mt-2">Envía el comprobante por WhatsApp.</p>
            </div>
          )}
          <Link href="/">
            <button className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-5 rounded-3xl font-black text-base transition-all shadow-xl">
              Volver a la tienda 🌸
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#3D2852] pt-32 pb-20 px-6">
      <CartDialog />
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center mb-16">
          <Link href="/#catalogo" className="inline-flex items-center gap-2 text-[#E6E6E6]/60 font-bold mb-6 hover:text-white transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:translate-x-[-5px] transition-transform" /> Seguir comprando
          </Link>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="cursor-pointer bg-[#2A1B38]/60 backdrop-blur-3xl p-8 px-12 rounded-[3.5rem] border-2 border-[#5A3F73]/40 shadow-2xl flex flex-col items-center group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5A3F73] to-transparent opacity-50" />
            <ShoppingBag className="w-12 h-12 text-[#5A3F73] mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl font-serif font-bold text-white mb-1">
              {items.length === 0 ? "Tu carrito está vacío" : `Tienes ${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
            </h2>
            <p className="text-[#5A3F73] font-black text-xs uppercase tracking-widest flex items-center gap-2">
              Haz clic para ver/cambiar tu pedido <ArrowRight className="w-3 h-3" />
            </p>
            {items.length > 0 && (
              <div className="absolute top-6 right-8 bg-[#5A3F73] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
            )}
          </motion.div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Columna izquierda */}
          <div className="flex-1 space-y-10">
            {/* Datos de Entrega */}
            <div className="bg-[#2A1B38]/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-[#5A3F73]/30 space-y-8">
               <h3 className="text-xl font-bold text-[#5A3F73] flex items-center gap-3">
                 <User className="w-6 h-6" /> DATOS DE ENTREGA
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input ref={receiverNameRef} className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Nombre de quien RECIBE *" />
                 <input ref={senderNameRef} className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Nombre de quien ENVÍA *" />
                 <input ref={phoneRef} type="tel" className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Celular (Para confirmaciones) *" />
                 <input ref={dateTimeRef} type="datetime-local" className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium [color-scheme:dark]" />
                 <input ref={addressRef} className="w-full md:col-span-2 bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Dirección exacta (Ciudadela, Manzana, Villa)..." />
               </div>
               <textarea ref={cardMessageRef} className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium h-32 placeholder:text-[#E6E6E6]/30" placeholder="Mensaje para la tarjeta (Opcional)..."></textarea>
            </div>

            {/* Método de Pago */}
            <div className="bg-[#2A1B38]/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-[#5A3F73]/30 space-y-8">
               <h3 className="text-xl font-bold text-[#5A3F73] flex items-center gap-3">
                 <CreditCard className="w-6 h-6" /> MÉTODO DE PAGO
               </h3>
               <div className="flex gap-4">
                 {[
                   { label: "Transferencia", icon: "🏦" },
                   { label: "Tarjeta", icon: "💳" }
                 ].map((p, i) => (
                   <button 
                     key={i} 
                     onClick={() => setPaymentMethod(p.label)}
                     className={cn(
                       "flex-1 p-6 rounded-2xl font-bold transition-all text-sm flex flex-col items-center gap-2 border",
                       paymentMethod === p.label 
                         ? "bg-[#5A3F73] text-white border-[#5A3F73] shadow-lg scale-105" 
                         : "bg-[#3D2852]/50 text-[#E6E6E6]/60 hover:bg-[#5A3F73]/50 border-[#5A3F73]/20 hover:text-white"
                     )}
                   >
                     <span className="text-2xl">{p.icon}</span> {p.label}
                   </button>
                 ))}
               </div>

               <AnimatePresence>
                 {paymentMethod === "Transferencia" && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0, marginTop: 0 }}
                     animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                     exit={{ opacity: 0, height: 0, marginTop: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="bg-[#3D2852]/30 border border-dashed border-[#5A3F73] rounded-2xl p-8">
                       <p className="text-[#E6E6E6]/80 text-sm font-bold mb-4">📌 Datos para la transferencia:</p>
                       <div className="space-y-2 text-sm text-[#E6E6E6]/70">
                         <p><span className="font-bold text-[#E6E6E6]/90">Banco:</span> Banco del Pichincha</p>
                         <p><span className="font-bold text-[#E6E6E6]/90">Cuenta:</span> 2205748975</p>
                         <p><span className="font-bold text-[#E6E6E6]/90">Tipo:</span> Corriente</p>
                         <p><span className="font-bold text-[#E6E6E6]/90">Titular:</span> DIFIORI</p>
                       </div>
                       <p className="text-[#E6E6E6]/40 text-xs mt-4">Envía el comprobante al WhatsApp después de confirmar.</p>
                     </div>
                   </motion.div>
                 )}
                 {paymentMethod === "Tarjeta" && (
                   <motion.div
                     initial={{ opacity: 0, height: 0, marginTop: 0 }}
                     animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                     exit={{ opacity: 0, height: 0, marginTop: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="bg-[#3D2852]/30 border border-dashed border-[#5A3F73] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                       <CreditCard className="w-8 h-8 text-[#5A3F73] mb-3" />
                       <span className="text-[#E6E6E6]/80 text-sm font-bold mb-1">Pago seguro con PayPhone</span>
                       <span className="text-[#E6E6E6]/40 text-xs">Al confirmar serás redirigido a la pasarela de pago para ingresar los datos de tu tarjeta</span>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Sidebar - Resumen */}
          <aside className="lg:w-[400px]">
             <div className="bg-[#2A1B38]/80 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border-2 border-[#5A3F73]/40 sticky top-32">
                <h3 className="text-2xl font-serif font-bold text-[#E6E6E6] mb-8 flex items-center gap-3 underline decoration-[#5A3F73] decoration-4">
                   <ShoppingBag className="w-6 h-6" /> RESUMEN
                </h3>
                
                <div className="space-y-6 mb-10 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                  {items.length === 0 ? (
                    <p className="text-[#E6E6E6]/40 text-sm text-center py-4">Tu carrito está vacío.</p>
                  ) : (
                    items.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-16 h-20 rounded-2xl overflow-hidden border border-[#5A3F73]/30 shadow-lg shrink-0">
                          <img src={item.product.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#E6E6E6] text-xs leading-tight">{item.product.name}</h4>
                          <p className="text-[#5A3F73] font-black text-sm mt-1">{item.product.price}</p>
                          <p className="text-[9px] uppercase font-bold text-[#E6E6E6]/30 mt-1">Cant: {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                 <div className="mb-6 relative bg-[#3D2852]/20 p-5 rounded-2xl border border-[#5A3F73]/20">
                    <label className="text-[10px] uppercase font-bold text-[#E6E6E6]/60 tracking-widest block mb-3">Zona de Entrega</label>
                    <div className="relative">
                      <select 
                        value={sector.name}
                        onChange={(e) => setSector(SECTORS.find(s => s.name === e.target.value) || SECTORS[0])}
                        className="w-full bg-[#5A3F73]/20 p-4 rounded-xl border border-[#5A3F73]/30 outline-none focus:border-[#5A3F73] text-[#E6E6E6] text-sm font-bold cursor-pointer appearance-none"
                      >
                        {SECTORS.map(s => (
                          <option key={s.name} value={s.name} className="bg-[#2A1B38] text-white">
                            {s.name} {s.price > 0 ? `(+$${s.price.toFixed(2)})` : '(Gratis)'}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronLeft className="w-4 h-4 text-[#E6E6E6]/50 -rotate-90" />
                      </div>
                    </div>
                 </div>

                <div className="mb-6 bg-[#3D2852]/20 p-5 rounded-2xl border border-[#5A3F73]/20">
                    <label className="text-[10px] uppercase font-bold text-[#E6E6E6]/60 tracking-widest block mb-3">¿Tienes un cupón?</label>
                    <div className="flex gap-2">
                       <input 
                         type="text"
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value)}
                         placeholder="CÓDIGO"
                         disabled={!!appliedCoupon}
                         className="flex-1 bg-[#5A3F73]/20 p-3 rounded-xl border border-[#5A3F73]/30 outline-none focus:border-[#5A3F73] text-[#E6E6E6] text-xs font-bold uppercase"
                       />
                       {appliedCoupon ? (
                         <button 
                           onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                           className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 text-xs font-bold"
                         >
                           QUITAR
                         </button>
                       ) : (
                         <button 
                           onClick={handleValidateCoupon}
                           disabled={isValidatingCoupon || !couponCode}
                           className="px-4 py-2 bg-[#5A3F73] text-white rounded-xl font-bold text-xs disabled:opacity-50"
                         >
                           {isValidatingCoupon ? "..." : "APLICAR"}
                         </button>
                       )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-green-400 text-[10px] font-bold mt-2 uppercase">✓ Cupón aplicado con éxito</p>
                    )}
                 </div>

                 <div className="space-y-4 pt-6 border-t border-[#5A3F73]/20">
                   <div className="flex justify-between text-[#E6E6E6]/40 font-medium text-sm">
                     <span>Subtotal</span>
                     <span>${cartSubtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-[#E6E6E6]/40 font-medium text-sm">
                     <span className="truncate max-w-[200px]">Envío ({sector.name.split(" ")[0]})</span>
                     <span className="text-[#5A3F73]">{sector.price === 0 ? "GRATIS" : `+$${sector.price.toFixed(2)}`}</span>
                   </div>
                   {discountAmount > 0 && (
                     <div className="flex justify-between text-green-400 font-bold text-sm">
                       <span>Descuento {appliedCoupon?.type === "PERCENTAGE" ? `(${appliedCoupon.percent_value * 100}%)` : ""}</span>
                       <span>-${discountAmount.toFixed(2)}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-2xl font-black text-[#E6E6E6] pt-4 border-t border-[#5A3F73]/10">
                     <span className="font-serif">TOTAL</span>
                     <span className="text-[#5A3F73]">${finalTotal.toFixed(2)}</span>
                   </div>
                 </div>

                {/* Error message */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 text-red-400 text-xs text-center font-bold bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleConfirmOrder}
                  disabled={items.length === 0 || orderStatus === "loading"}
                  className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-6 rounded-3xl font-black text-lg transition-all shadow-xl shadow-[#2A1B38] mt-10 active:scale-95 border border-[#E6E6E6]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {orderStatus === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `PAGAR $${finalTotal.toFixed(2)} 🌸`
                  )}
                </button>
                <p className="text-center text-[10px] text-[#E6E6E6]/20 mt-6 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                  <Truck className="w-3 h-3" /> Entrega hoy garantizada
                </p>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
