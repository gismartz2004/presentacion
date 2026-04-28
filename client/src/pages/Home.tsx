import React, { useEffect, useRef, useState } from "react";
import { Star, Instagram, Facebook, Music2, Mail, MessageSquare, Phone } from "lucide-react";
import { Link } from "wouter";
import { Banner } from "@/components/Banner";
import { CategorySidebar } from "@/components/CategorySidebar";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { FAQS } from "@/data/mock";
import { useProducts } from "@/hooks/useProducts";
import { useCompany } from "@/hooks/useCompany";
import { useReviews, useCreateReview } from "@/hooks/useReviews";
import { Seo } from "@/components/Seo";
import { DEFAULT_COMPANY, absoluteUrl } from "@/lib/site";
import { formatCategoryDisplayName, getCategoryPath } from "@shared/catalog";

const HOME_PRODUCTS_PER_CATEGORY = 2;
const HOME_CATEGORY_LIMIT = 4;
const HOME_PRODUCT_LIMIT = HOME_PRODUCTS_PER_CATEGORY * HOME_CATEGORY_LIMIT;

export default function Home() {
  const reviewsSectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadReviews, setShouldLoadReviews] = useState(false);
  const { data: dbReviews = [], isLoading: isLoadingReviews } = useReviews(shouldLoadReviews);
  const createReviewMutation = useCreateReview();
  
  const [newReview, setNewReview] = useState({ name: "", content: "", stars: 5 });
  const [showForm, setShowForm] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMessage("");
    if (!newReview.name || !newReview.content) return;

    try {
      await createReviewMutation.mutateAsync(newReview);
      setNewReview({ name: "", content: "", stars: 5 });
      setShowForm(false);
      setReviewMessage("Gracias por compartir tu experiencia.");
    } catch (err) {
      console.error("Error al enviar la reseña:", err);
      setReviewMessage("No pudimos guardar tu reseña. Inténtalo nuevamente.");
    }
  };

  // Productos y Datos desde la API real
  const { data: allProducts = [], isLoading: isLoadingAll } = useProducts({ limit: HOME_PRODUCT_LIMIT });
  const { data: company } = useCompany();
  const categorySections = React.useMemo(() => {
    const sections = new Map<string, typeof allProducts>();

    for (const product of allProducts) {
      const category = product.category || "General";
      const existing = sections.get(category) || [];
      existing.push(product);
      sections.set(category, existing);
    }

    return Array.from(sections.entries())
      .map(([category, products]) => ({
        category,
        label: formatCategoryDisplayName(category),
        href: getCategoryPath(category),
        products: products.slice(0, HOME_PRODUCTS_PER_CATEGORY),
      }))
      .slice(0, HOME_CATEGORY_LIMIT);
  }, [allProducts]);

  useEffect(() => {
    if (shouldLoadReviews) return;

    const target = reviewsSectionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldLoadReviews(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadReviews(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadReviews]);

  const companyPhoneDisplay = company?.phone || DEFAULT_COMPANY.phoneDisplay;
  const companyPhoneDigits = companyPhoneDisplay.replace(/[^0-9]/g, "") || DEFAULT_COMPANY.phoneDigits;
  const companyEmail = company?.email || DEFAULT_COMPANY.email;
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Florist",
        "@id": "https://difiori.com/#organization",
        name: "DIFIORI",
        url: "https://difiori.com/",
        image: absoluteUrl("/opengraph.jpg"),
        telephone: `+${companyPhoneDigits}`,
        email: companyEmail,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Guayaquil",
          addressCountry: "EC",
        },
        areaServed: ["Guayaquil", "Samborondón", "Durán", "Vía a la Costa"],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background selection:bg-accent selection:text-white overflow-clip scroll-smooth">
      <Seo
        title="Floristería en Guayaquil | Arreglos Florales y Regalos a Domicilio | DIFIORI"
        description="Compra arreglos florales, ramos de rosas y regalos a domicilio en Guayaquil con DIFIORI. Entregas en Guayaquil, Samborondón, Durán y Vía a la Costa."
        path="/"
        schema={homeSchema}
      />
      <h1 className="sr-only">DIFIORI Floristería Guayaquil - Arreglos Florales, Ramos de Rosas y Regalos a Domicilio</h1>
      
      {/* 1. Header is in App.tsx/Navbar.tsx */}
      
      {/* 2. Banner Section */}
      <section className="relative pt-24 lg:pt-28">
        <Banner />
      </section>

      <div className="mx-auto w-full max-w-[1600px] px-6 py-20 relative z-20 xl:px-10">
        
        {/* Main Content: Sidebar + Catalog */}
        <section className="relative z-20 flex flex-col gap-10 pt-10 mb-40 lg:flex-row xl:gap-8">
          <aside className="h-fit shrink-0 lg:sticky lg:top-32 lg:w-[280px] xl:w-[300px]">
            <CategorySidebar variant="link" />
          </aside>

          <main className="flex-1 w-full overflow-hidden">
            {/* Catálogo General Section */}
            <div id="catalogo" className="flex items-center gap-6 mb-12 opacity-60">
              <div className="h-[1px] flex-1 bg-foreground"></div>
              <h2 className="text-foreground font-black uppercase tracking-[0.5em] text-sm whitespace-nowrap">
                Catálogo de Arreglos Florales
              </h2>
              <div className="h-[1px] flex-1 bg-foreground"></div>
            </div>

            <div id="product-list" className="space-y-20 scroll-mt-32">
              {isLoadingAll ? (
                // Skeleton loading state (minimal)
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="product-skeleton" />
                ))
              ) : categorySections.length > 0 ? (
                categorySections.map((section) => (
                  <section key={section.category} className="space-y-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h2 className="text-3xl font-black leading-tight text-[#4B1F6F] md:text-5xl" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                          {section.label}
                        </h2>
                        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#4B1F6F]/75 md:text-lg">
                          Selección destacada de {section.label.toLowerCase()} con entrega en Guayaquil.
                        </p>
                      </div>
                      <Link href={section.href}>
                        <button type="button" className="ui-btn-secondary">
                          Ver categoría
                        </button>
                      </Link>
                    </div>

                    <div className="product-grid">
                      {section.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="empty-state col-span-full">
                  <p className="empty-state-title">
                    No se encontraron productos en esta categoría.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-24 text-center">
              <Link href="/shop">
                <button type="button" className="ui-btn-secondary px-12">
                  Ver Colección Completa
                </button>
              </Link>
            </div>
          </main>
        </section>

        {/* REVIEWS SECTION */}
        <section 
          id="testimonios"
          ref={reviewsSectionRef}
          className="deferred-section relative left-1/2 right-1/2 mb-32 w-screen -translate-x-1/2 border-y border-[#DECDF0] bg-[#F4ECFB] px-6 py-20 sm:px-10"
        >
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-transparent to-primary/20" />
           
           <div className="text-center mb-20">
              <h2 className="section-title">Lo que dicen de nosotros</h2>
              <p className="section-copy">Tu satisfacción es nuestra mayor recompensa.</p>
           </div>
            <div className="text-center mb-10">
               <button 
                 type="button"
                 onClick={() => setShowForm(!showForm)}
                 className="ui-btn-primary"
               >
                 {showForm ? "Cerrar Formulario" : "Escribir una reseña"}
               </button>
            </div>

            {showForm ? (
                <div className="mx-auto mb-20 max-w-xl overflow-hidden">
                  <form onSubmit={handleAddReview} className="surface-card space-y-6 p-8">
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
                      disabled={createReviewMutation.isPending}
                      className="ui-btn-primary w-full"
                    >
                      {createReviewMutation.isPending ? "Publicando..." : "Publicar Reseña"}
                    </button>
                  </form>
                </div>
            ) : null}

            {reviewMessage ? (
              <p className="mx-auto mb-10 max-w-xl rounded-2xl border border-primary/15 bg-white/70 px-5 py-4 text-center text-sm font-semibold text-foreground/70">
                {reviewMessage}
              </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
               {!shouldLoadReviews || isLoadingReviews ? (
                  <div className="col-span-full text-center py-10 opacity-30">Cargando experiencias...</div>
               ) : dbReviews.length > 0 ? (
                 dbReviews.map((review, i) => (
                   <div 
                     key={review.id || i}
                     className="surface-card group relative p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-10"
                   >
                      <div className="flex gap-1 mb-6 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                         {[...Array(review.stars)].map((_, s) => <Star key={s} className="w-5 h-5 fill-accent text-accent" />)}
                      </div>
                      <p className="mb-8 text-[1.7rem] font-black leading-relaxed text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>"{review.content}"</p>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-accent transition-transform duration-700 group-hover:rotate-[360deg]">{review.name[0]}</div>
                         <div>
                            <h4 className="text-[1.2rem] font-black uppercase tracking-[0.14em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>{review.name}</h4>
                            <span className="text-[1rem] font-black uppercase tracking-[0.12em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>{review.role || "Cliente"}</span>
                         </div>
                      </div>
                   </div>
                 ))
               ) : (
                  <div className="col-span-full text-center py-20 italic font-serif text-foreground/60 text-2xl">
                    Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
                  </div>
               )}
            </div>
        </section>

        <section
          id="faq"
          className="deferred-section mb-40"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black leading-tight text-[#4B1F6F] md:text-6xl" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>Preguntas frecuentes</h2>
            <p className="mt-3 text-xl leading-relaxed text-[#4B1F6F] md:text-2xl" style={{ fontFamily: "Arial, sans-serif" }}>
              Información clave sobre entregas, pagos y tiempos de atención.
            </p>
          </div>

          <div className="grid gap-6 max-w-4xl mx-auto">
            {FAQS.map((faq) => (
              <article key={faq.question} className="surface-card p-8">
                <h3 className="mb-4 text-2xl font-black text-[#4B1F6F] md:text-3xl" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>{faq.question}</h3>
                <p className="text-lg leading-relaxed text-[#4B1F6F] md:text-xl" style={{ fontFamily: "Arial, sans-serif" }}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* FOOTER MULTI-SECTION PROFESSIONAL */}
      <footer 
        id="contacto"
        className="deferred-section border-t border-[#DECDF0] bg-[#F4ECFB] px-6 pt-44 pb-14"
      >
        <div className="container mx-auto">
           <div className="mb-36 grid grid-cols-1 gap-24 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                 <img
                   src="/logo-footer.png"
                   alt="DIFIORI"
                   className="mb-12 h-36 w-auto object-contain"
                   loading="lazy"
                 />
                 <p className="mb-12 text-[1.45rem] font-black leading-relaxed text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                   Diseñando emociones con las flores más frescas de exportación en Guayaquil.
                 </p>
                 <div className="flex gap-4">
                    {[Instagram, Facebook, Music2].map((Icon, i) => (
                      <div key={i} className="cursor-pointer rounded-2xl border border-[#DECDF0] bg-white/35 p-6 text-[#3D2852] transition-all duration-500 hover:scale-110 hover:bg-accent hover:text-white">
                         <Icon className="h-7 w-7" />
                      </div>
                    ))}
                 </div>
              </div>
              
              <div>
                 <h4 className="mb-12 text-[1.2rem] font-black uppercase tracking-[0.3em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>La Maison</h4>
                 <ul className="space-y-6 text-[1rem] font-black uppercase tracking-widest text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Tienda</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Contacto</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Preguntas Frecuentes</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Términos y Condiciones</li>
                 </ul>
              </div>

              <div>
                 <h4 className="mb-12 text-[1.2rem] font-black uppercase tracking-[0.3em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>Soporte</h4>
                 <ul className="space-y-6 text-[1rem] font-black uppercase tracking-widest text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Envíos y Entregas</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Cuidado de Flores</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">Política de Privacidad</li>
                    <li className="hover:text-accent cursor-pointer transition-all duration-500 hover:translate-x-2">FAQs Soporte</li>
                 </ul>
              </div>

              <div>
                 <h4 className="mb-12 text-[1.2rem] font-black uppercase tracking-[0.3em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>Contacto Directo</h4>
                 <div className="space-y-10">
                    <div className="flex items-center gap-5 group">
                       <div className="rounded-2xl bg-accent/10 p-6 transition-colors duration-500 group-hover:bg-accent"><MessageSquare className="h-6 w-6 text-accent transition-colors duration-500 group-hover:text-white"/></div>
                       <div className="text-base font-black uppercase text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                          <span className="block mb-1.5 text-[#4B1F6F]">WhatsApp</span>
                          <a href={`https://wa.me/${companyPhoneDigits}`} className="hover:text-accent transition-colors duration-500">{companyPhoneDisplay}</a>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                       <div className="rounded-2xl bg-accent/10 p-6 transition-colors duration-500 group-hover:bg-accent"><Phone className="h-6 w-6 text-accent transition-colors duration-500 group-hover:text-white"/></div>
                       <div className="text-base font-black uppercase text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                          <span className="block mb-1.5 text-[#4B1F6F]">Llamadas</span>
                          <span className="group-hover:text-accent transition-colors duration-500">{companyPhoneDisplay}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 group">
                       <div className="rounded-2xl bg-accent/10 p-6 transition-colors duration-500 group-hover:bg-accent"><Mail className="h-6 w-6 text-accent transition-colors duration-500 group-hover:text-white"/></div>
                       <div className="text-base font-black uppercase text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                          <span className="block mb-1.5 text-[#4B1F6F]">Email</span>
                          <span className="break-all group-hover:text-accent transition-colors duration-500">{companyEmail}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col items-center justify-between gap-10 border-t border-primary/10 pt-14 md:flex-row">
              <p className="text-base font-black uppercase tracking-[0.35em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                 © 2026 DIFIORI Ecuador. Todos los derechos reservados.
              </p>
              <div className="flex gap-8 text-base font-black uppercase tracking-[0.3em] text-[#4B1F6F]" style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}>
                 <span className="hover:text-accent cursor-pointer transition-colors duration-500">Guayaquil, Ecuador</span>
              </div>
           </div>
        </div>
      </footer>
    </main>
  );
}
