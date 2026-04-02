import React, { useState } from "react";
import { ShoppingBag, ChevronLeft, CreditCard, Truck, User, Upload } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const SECTORS = [
  { name: "Norte (Urdesa, Alborada, Sauces)", price: 0 },
  { name: "Centro / Sur", price: 3 },
  { name: "Ceibos / Los Olivos", price: 4 },
  { name: "Vía a la Costa", price: 5 },
  { name: "Samborondón / Vía a Salitre", price: 5 },
  { name: "Durán", price: 6 }
];

export default function Checkout() {
  const { items, cartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [sector, setSector] = useState(SECTORS[0]);

  const finalTotal = cartTotal + sector.price;

  return (
    <div className="min-h-screen bg-[#3D2852] pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[#E6E6E6]/60 font-bold mb-10 hover:translate-x-[-10px] transition-transform hover:text-white">
          <ChevronLeft className="w-5 h-5" /> Regresar a la tienda
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Resumen de Compra - 1 Single Page */}
          <div className="flex-1 space-y-10">
            <h1 className="text-4xl font-serif font-bold text-[#E6E6E6] mb-8 tracking-tight">FINALIZAR COMPRA</h1>
            
            {/* Delivery Info */}
            <div className="bg-[#2A1B38]/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-2xl border border-[#5A3F73]/30 space-y-8">
               <h3 className="text-xl font-bold text-[#5A3F73] flex items-center gap-3">
                 <User className="w-6 h-6" /> DATOS DE ENTREGA
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Nombre de quien RECIBE..." />
                 <input className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Nombre de quien ENVÍA..." />
                 <input className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Celular (Para confirmaciones)..." />
                 <input type="datetime-local" className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30 [color-scheme:dark]" />
                 
                 <input className="w-full md:col-span-2 bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium placeholder:text-[#E6E6E6]/30" placeholder="Dirección exacta (Ciudadela, Manzana, Villa)..." />
               </div>
               <textarea className="w-full bg-[#3D2852]/50 p-5 rounded-2xl border border-[#5A3F73]/20 outline-none focus:border-[#5A3F73] text-[#E6E6E6] font-medium h-32 placeholder:text-[#E6E6E6]/30" placeholder="Mensaje para la tarjeta (Opcional)..."></textarea>
            </div>

            {/* Payment Sim */}
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
                     <div className="bg-[#3D2852]/30 border border-dashed border-[#5A3F73] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3D2852]/50 transition-colors group relative">
                       <Upload className="w-8 h-8 text-[#5A3F73] mb-3 group-hover:scale-110 transition-transform" />
                       <span className="text-[#E6E6E6]/80 text-sm font-bold mb-1">Cargar comprobante</span>
                       <span className="text-[#E6E6E6]/40 text-xs">Arrastra o haz clic para subir captura (PNG, JPG)</span>
                       <input type="file" title="" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

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
                       <option value="" disabled className="bg-[#2A1B38] text-white">Selecciona sector...</option>
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

                <div className="space-y-4 pt-6 border-t border-[#5A3F73]/20">
                  <div className="flex justify-between text-[#E6E6E6]/40 font-medium">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#E6E6E6]/40 font-medium">
                    <span className="truncate max-w-[200px]">Envío ({sector.name.split(" ")[0]})</span>
                    <span className="text-[#5A3F73]">{sector.price === 0 ? "GRATIS" : `+$${sector.price.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-[#E6E6E6] pt-4">
                    <span className="font-serif">TOTAL</span>
                    <span className="text-[#5A3F73]">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  disabled={items.length === 0}
                  className="w-full bg-[#5A3F73] hover:bg-[#4A3362] text-white py-6 rounded-3xl font-black text-lg transition-all shadow-xl shadow-[#2A1B38] mt-10 active:scale-95 border border-[#E6E6E6]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CONFIRMAR ORDEN 🌸
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
