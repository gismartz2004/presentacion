import React from "react";
import { motion } from "framer-motion";
import { NavbarV2 } from "@/components/v2/NavbarV2";
import { ProductCardV2 } from "@/components/v2/ProductCardV2";
import { ArrowRight, Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "@/components/Logo";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

export default function HomeV2() {
  const { data: allProducts = [], isLoading: isLoadingAll } = useProducts();
  const { data: categories = [] } = useCategories();
  
  const bestSellers = allProducts.filter(p => p.isBestSeller);

  return (
    <div className="min-h-screen bg-[#FCFAF8] selection:bg-[#2C2C2B] selection:text-white overflow-x-hidden pt-20">
      <NavbarV2 />

      {/* ── HERO SECTION: ARTISTIC EDITORIAL ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-8 lg:px-16 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-12 xl:col-span-5 z-20"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-[#A8988A]" />
              <span className="text-[#A8988A] text-[10px] font-black uppercase tracking-[0.5em]">
                Maison Difiori • 2025
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[120px] font-serif text-[#2C2C2B] leading-[0.9] mb-10 italic">
              El Arte <br /> 
              <span className="not-italic text-outline-dark">del Regalo</span>
            </h1>
            
            <p className="text-[#2C2C2B]/70 text-lg lg:text-xl max-w-md leading-relaxed mb-12 font-serif italic">
              Curamos momentos inolvidables a través de diseños florales que respiran elegancia y sofisticación atemporal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="group bg-[#2C2C2B] text-white px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#A8988A] transition-all duration-500 flex items-center justify-center gap-4 shadow-xl">
                Explorar Colecciones 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="border border-[#E5DACD] text-[#2C2C2B] px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-widest hover:border-[#2C2C2B] transition-all duration-500">
                Ver La Maison
              </button>
            </div>
          </motion.div>

          {/* Large Artistic Image container */}
          <div className="lg:col-span-12 xl:col-span-7 relative h-[60vh] lg:h-[85vh]">
            <motion.div
              initial={{ opacity: 0, scale: 1.1, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full relative"
            >
              {/* Main Image */}
              <div className="absolute inset-x-0 inset-y-0 overflow-hidden rounded-[3rem] lg:rounded-[4rem] shadow-2xl">
                <img 
                  src="/assets/v2_hero.png" 
                  className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
                  alt="artistic-floral-design"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2C2C2B]/20 to-transparent" />
              </div>

              {/* Floating Decorative Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-10 lg:p-14 shadow-2xl rounded-[3rem] hidden md:block max-w-[300px] border border-[#E5DACD]/30"
              >
                <div className="text-[12px] text-[#A8988A] font-black uppercase tracking-[0.4em] mb-4">Destacado</div>
                <div className="text-3xl font-serif text-[#2C2C2B] leading-tight mb-4 italic">Bouquet d'Auteur</div>
                <div className="text-[#2C2C2B]/40 text-xs leading-relaxed font-serif underline decoration-[#A8988A] decoration-2 underline-offset-4">Edición de Coleccionista</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── UNIFIED MARQUEE ── */}
      <div className="py-16 bg-[#2C2C2B] overflow-hidden whitespace-nowrap mt-24">
        <motion.div 
          animate={{ x: [0, -1500] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="inline-block"
        >
          {[...Array(15)].map((_, i) => (
            <span key={i} className="text-white/90 text-[11px] font-black uppercase tracking-[1em] mr-40 inline-flex items-center gap-10">
              DIFIORI ART ATELIER <div className="w-2 h-2 rounded-full bg-[#A8988A]" />
              EXCLUSIVIDAD FLORAL <div className="w-2 h-2 rounded-full bg-[#A8988A]" />
              GUAYAQUIL LUXE <div className="w-2 h-2 rounded-full bg-[#A8988A]" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── CATEGORIES: INSTAGRAM-CHIC ── */}
      <section className="py-32 border-b border-[#E5DACD]/20 overflow-hidden">
        <div className="container mx-auto px-8 lg:px-16 mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="max-w-xl">
            <span className="text-[#A8988A] text-[11px] font-black uppercase tracking-[0.5em] mb-4 block underline decoration-4 underline-offset-8">Curaduría</span>
            <h2 className="text-5xl md:text-7xl font-serif text-[#2C2C2B] leading-none mb-6">Nuestras <br/> Colecciones</h2>
          </div>
          <Link href="/v2" className="group text-[12px] font-black uppercase tracking-[0.3em] text-[#2C2C2B] flex items-center gap-4 hover:text-[#A8988A] transition-colors">
            Ver catálogo completo <div className="w-10 h-[1px] bg-[#2C2C2B] group-hover:bg-[#A8988A] group-hover:w-16 transition-all duration-500" />
          </Link>
        </div>
        <div className="flex gap-10 lg:gap-16 overflow-x-auto px-8 lg:px-16 no-scrollbar pb-8">
          {categories.map((catName: string, i: number) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8 }} 
              className="flex flex-col items-center gap-6 cursor-pointer min-w-fit group"
            >
              <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full p-1 border border-[#E5DACD] group-hover:border-[#2C2C2B] transition-colors duration-500">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                  <img 
                    src={`https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=200&auto=format&fit=crop`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={catName}
                  />
                </div>
                {/* Visual indicator ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <circle 
                    cx="50%" cy="50%" r="48%" 
                    fill="none" 
                    stroke="#2C2C2B" 
                    strokeWidth="1"
                    strokeDasharray="100 100"
                    className="animate-dash"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2C2C2B] text-center w-full group-hover:text-[#A8988A] transition-colors">
                {catName}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Grid - Editor's Choice */}
      <section className="container mx-auto px-8 lg:px-16 mb-40">
        <div className="flex flex-col gap-2 mb-20">
          <span className="text-[#A8988A] text-[10px] lg:text-[12px] font-black uppercase tracking-[0.4em] block">
            Selecciones de Temporada
          </span>
          <h2 className="text-4xl lg:text-6xl font-serif text-[#2C2C2B]">La Selección del Editor</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {isLoadingAll ? (
             Array(4).fill(0).map((_, i) => (
               <div key={i} className="aspect-[2/3] bg-[#F3F0EC] animate-pulse" />
             ))
          ) : bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <ProductCardV2 key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-[#2C2C2B]/40 font-serif italic">
              No hay selecciones destacadas disponibles.
            </div>
          )}
        </div>
        <div className="mt-24 text-center">
            <button className="text-[#2C2C2B] text-[10px] font-black uppercase tracking-[0.6em] hover:text-[#A8988A] transition-all relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-[#2C2C2B] after:bottom-[-8px] after:left-0 hover:after:bg-[#A8988A]">
                Explorar Catálogo Completo
            </button>
        </div>
      </section>

      {/* Newsletter - Minimalist */}
      <section className="bg-[#F3F0EC] py-32 lg:py-48">
        <div className="container mx-auto px-8 lg:px-16 text-center max-w-4xl">
            <h2 className="text-4xl lg:text-6xl font-serif text-[#2C2C2B] mb-8 italic leading-tight uppercase tracking-tighter">Únete a nuestra <br/> Maison</h2>
            <p className="text-[#2C2C2B]/60 text-base lg:text-xl mb-16 font-serif italic max-w-2xl mx-auto leading-relaxed">
               Recibe invitaciones a lanzamientos exclusivos y consejos de arte floral directamente de nuestros curadores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto border-b border-[#2C2C2B]/20 pb-4 focus-within:border-[#2C2C2B] transition-colors">
                <input 
                    className="flex-1 bg-transparent py-4 px-2 outline-none text-[#2C2C2B] placeholder:text-[#2C2C2B]/30 font-serif italic text-lg" 
                    placeholder="Tu dirección de correo electrónico" 
                />
                <button className="text-[#2C2C2B] px-6 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:text-[#A8988A] transition-colors whitespace-nowrap">
                    Suscribirme
                </button>
            </div>
        </div>
      </section>

      {/* Footer V2 */}
      <footer className="bg-white pt-32 pb-16">
        <div className="container mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                <div className="lg:col-span-2">
                    <Logo variant="dark" size="lg" className="mb-10 items-start" />
                    <p className="text-[#2C2C2B]/40 text-xs lg:text-sm max-w-xs leading-relaxed italic font-serif">
                        DIFIORI no es solo una florería; es un atelier dedicado al arte de regalar emociones con elegancia atemporal y diseño de vanguardia.
                    </p>
                </div>
                <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2C2C2B] mb-10">Maison</h4>
                     <ul className="space-y-4 text-[12px] text-[#A8988A] font-medium tracking-wide">
                        <li className="hover:text-[#2C2C2B] cursor-pointer transition-colors">La Historia</li>
                        <li className="hover:text-[#2C2C2B] cursor-pointer transition-colors">Atelier de Diseño</li>
                        <li className="hover:text-[#2C2C2B] cursor-pointer transition-colors">Puntos de Venta</li>
                        <li className="hover:text-[#2C2C2B] cursor-pointer transition-colors">Contacto Privado</li>
                     </ul>
                </div>
                <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2C2C2B] mb-10">Concierge</h4>
                     <div className="flex gap-8 items-center">
                        <Instagram className="w-5 h-5 text-[#A8988A] hover:text-[#2C2C2B] cursor-pointer transition-colors" />
                        <Facebook className="w-5 h-5 text-[#A8988A] hover:text-[#2C2C2B] cursor-pointer transition-colors" />
                        <Mail className="w-5 h-5 text-[#A8988A] hover:text-[#2C2C2B] cursor-pointer transition-colors" />
                     </div>
                </div>
            </div>
            <div className="pt-12 border-t border-[#E5DACD]/40 flex flex-col sm:flex-row justify-between items-center gap-6">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#A8988A]">
                    © 2025 DIFIORI ART ATELIER. GUAYAQUIL.
                </p>
                <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-[#A8988A]">
                    <span className="hover:text-[#2C2C2B] cursor-pointer">Privacidad</span>
                    <span className="hover:text-[#2C2C2B] cursor-pointer">Términos</span>
                </div>
            </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        .animate-dash {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: dash 1s ease-in-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
