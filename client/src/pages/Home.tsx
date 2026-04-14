import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Star, Instagram, Facebook, Mail, MessageSquare, Phone } from "lucide-react";
import { Link } from "wouter";
import { Banner } from "@/components/Banner";
import { CategorySidebar } from "@/components/CategorySidebar";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { Logo } from "@/components/Logo";
import { FAQS, CARE_GUIDE, INITIAL_PRODUCTS } from "@/data/mock";
import { useProducts, useFeaturedProducts } from "@/hooks/useProducts";
import { useCompany } from "@/hooks/useCompany";
import { useReviews, useCreateReview } from "@/hooks/useReviews";

export default function Home() {
  const { data: dbReviews = [], isLoading: isLoadingReviews } = useReviews();
  const createReviewMutation = useCreateReview();
  
  const [newReview, setNewReview] = useState({ name: "", content: "", stars: 5 });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.content) return;

    try {
      await createReviewMutation.mutateAsync(newReview);
      setNewReview({ name: "", content: "", stars: 5 });
      setShowForm(false);
    } catch (err) {
      console.error("Error al enviar la reseña:", err);
    }
  };

  // Productos y Datos desde la API real
  const { data: allProducts = [], isLoading: isLoadingAll } = useProducts();
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useFeaturedProducts();
  const { data: company } = useCompany();

  const bestSellers = featuredProducts.length > 0 ? featuredProducts : allProducts.filter(p => p.isBestSeller);
  const catalogProducts = activeCategory === "Más Vendidos"
    ? allProducts.filter(p => p.isBestSeller)
    : activeCategory
      ? allProducts.filter(p => p.category === activeCategory)
      : allProducts;

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  return (
    <main className="min-h-screen bg-background selection:bg-accent selection:text-white overflow-clip scroll-smooth">
      <h1 className="sr-only">DIFIORI Floristería Guayaquil - Arreglos Florales, Ramos de Rosas y Regalos a Domicilio</h1>
      
      {/* 1. Header is in App.tsx/Navbar.tsx */}
      
      {/* 2. Banner Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative"
      >
        <Banner />
      </motion.section>

      <div className="container mx-auto px-6 py-20 relative z-20">
        
        {/* Main Content: Sidebar + Catalog */}
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row gap-16 pt-10 mb-40 relative z-20"
        >
          <aside className="lg:sticky lg:top-32 h-fit lg:w-64 shrink-0">
            <CategorySidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </aside>

          <main className="flex-1 w-full overflow-hidden">
            {/* Catálogo General Section */}
            <div id="catalogo" className="flex items-center gap-6 mb-12 opacity-30">
              <div className="h-[1px] flex-1 bg-foreground"></div>
              <h2 className="text-foreground font-black uppercase tracking-[0.5em] text-[10px] whitespace-nowrap">
                Catálogo {activeCategory ? `- ${activeCategory}` : 'de Arreglos Florales'}
              </h2>
              <div className="h-[1px] flex-1 bg-foreground"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {isLoadingAll ? (
                // Skeleton loading state (minimal)
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-80 bg-primary/5 animate-pulse rounded-[3rem]" />
                ))
              ) : catalogProducts.length > 0 ? (
                catalogProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-foreground/40 font-serif italic text-xl">
                    No se encontraron productos en esta categoría.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-24 text-center">
              <button className="bg-transparent border-2 border-primary hover:bg-primary/20 text-foreground px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 duration-500">
                Ver Colección Completa
              </button>
            </div>
          </main>
        </motion.section>

        {/* REVIEWS SECTION */}
        <motion.section 
          id="testimonios"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-40 py-24 bg-primary/5 rounded-[4rem] px-12 border border-primary/20 relative"
        >
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-transparent to-primary/20" />
           
           <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-serif text-foreground mb-4 italic">Lo que dicen de nosotros</h2>
              <p className="text-foreground/50 italic font-serif text-xl">Tu satisfacción es nuestra mayor recompensa.</p>
           </div>
            <div className="text-center mb-10">
               <button 
                 onClick={() => setShowForm(!showForm)}
                 className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
               >
                 {showForm ? "Cerrar Formulario" : "Escribir una reseña"}
               </button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="max-w-xl mx-auto mb-20 overflow-hidden"
                >
                  <form onSubmit={handleAddReview} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-primary/20 space-y-6">
                    <div className="flex justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, stars: star })}
                          className="transition-transform hover:scale-125"
                        >
                          <Star 
                            className={cn(
                              "w-8 h-8",
                              star <= newReview.stars ? "fill-accent text-accent" : "text-primary/20"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                    <input 
                      placeholder="Tu nombre"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full bg-primary/5 p-4 rounded-2xl border border-primary/10 outline-none focus:border-accent text-foreground font-bold placeholder:text-foreground/20"
                      required
                    />
                    <textarea 
                      placeholder="Cuéntanos tu experiencia..."
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                      className="w-full bg-primary/5 p-4 rounded-2xl border border-primary/10 outline-none focus:border-accent text-foreground font-medium h-32 placeholder:text-foreground/20"
                      required
                    />
                    <button 
                      type="submit"
                      className="w-full bg-foreground text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-colors shadow-lg"
                    >
                      Publicar Reseña
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
               {isLoadingReviews ? (
                  <div className="col-span-full text-center py-10 opacity-30">Cargando experiencias...</div>
               ) : dbReviews.length > 0 ? (
                 dbReviews.map((review, i) => (
                   <motion.div 
                     key={review.id || i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     whileHover={{ y: -8 }}
                     transition={{ duration: 0.5 }}
                     className="bg-white p-12 rounded-[3rem] shadow-xl border border-primary/10 relative group"
                   >
                      <div className="flex gap-1 mb-6 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                         {[...Array(review.stars)].map((_, s) => <Star key={s} className="w-5 h-5 fill-accent text-accent" />)}
                      </div>
                      <p className="text-foreground/80 text-lg leading-relaxed mb-8 italic font-serif">"{review.content}"</p>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-accent transition-transform duration-700 group-hover:rotate-[360deg]">{review.name[0]}</div>
                         <div>
                            <h4 className="font-black uppercase tracking-widest text-[10px] text-foreground">{review.name}</h4>
                            <span className="text-[10px] text-foreground/40 font-bold uppercase">{review.role || "Cliente"}</span>
                         </div>
                      </div>
                   </motion.div>
                 ))
               ) : (
                  <div className="col-span-full text-center py-20 italic font-serif text-foreground/40 text-xl">
                    Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
                  </div>
               )}
            </div>
        </motion.section>

      </div>

      {/* FOOTER MULTI-SECTION PROFESSIONAL */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="bg-white border-t border-primary/20 pt-40 pb-12 px-6"
      >
        <div className="container mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
              <div className="lg:col-span-1">
                 <Logo variant="dark" size="md" className="mb-10" />
                 <p className="text-foreground/50 text-sm leading-relaxed mb-10 italic font-serif">
                   Diseñando emociones con las flores más frescas de exportación en Guayaquil.
                 </p>
                 <div className="flex gap-4">
                    {[Instagram, Facebook, Mail].map((Icon, i) => (
                      <div key={i} className="p-4 bg-primary/5 rounded-2xl hover:bg-accent hover:text-white transition-all duration-500 cursor-pointer border border-primary/10 hover:scale-110">
                         <Icon className="w-5 h-5" />
                      </div>
                    ))}
                 </div>
              </div>
              
              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-10 opacity-70">La Maison</h4>
                 <ul className="space-y-5 text-sm text-foreground/40 font-bold uppercase tracking-widest text-[9px]">
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Tienda</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Contacto</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Preguntas Frecuentes</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Términos y Condiciones</li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-10 opacity-70">Soporte</h4>
                 <ul className="space-y-5 text-sm text-foreground/40 font-bold uppercase tracking-widest text-[9px]">
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Envíos y Entregas</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Cuidado de Flores</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Política de Privacidad</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">FAQs Soporte</li>
                 </ul>
              </div>

              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground mb-10 opacity-70">Contacto Directo</h4>
                 <div className="space-y-8">
                    <div className="flex items-center gap-5 group">
                       <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent transition-colors duration-500"><MessageSquare className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-500"/></div>
                       <div className="text-[10px] font-black uppercase">
                          <span className="block opacity-30 mb-1">WhatsApp</span>
                          <a href={`https://wa.me/${(company?.phone || "+593 99 798 4583").replace(/[^0-9]/g, "")}`} className="hover:text-accent transition-colors duration-500">{company?.phone || "+593 99 798 4583"}</a>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                       <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent transition-colors duration-500"><Phone className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-500"/></div>
                       <div className="text-[10px] font-black uppercase">
                          <span className="block opacity-30 mb-1">Llamadas</span>
                          <span className="group-hover:text-accent transition-colors duration-500">{company?.phone || "+593 99 798 4583"}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                       <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent transition-colors duration-500"><Mail className="w-4 h-4 text-accent group-hover:text-white transition-colors duration-500"/></div>
                       <div className="text-[10px] font-black uppercase">
                          <span className="block opacity-30 mb-1">Email</span>
                          <span className="break-all group-hover:text-accent transition-colors duration-500">{company?.email || "ventas@difiori.com.ec"}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-12 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-10">
              <p className="text-[9px] font-black uppercase tracking-[0.6em] text-foreground/20">
                 © 2026 DIFIORI Ecuador. Todos los derechos reservados.
              </p>
              <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20">
                 <span className="hover:text-accent cursor-pointer transition-colors duration-500">Guayaquil, Ecuador</span>
              </div>
           </div>
        </div>
      </motion.footer>
    </main>
  );
}
