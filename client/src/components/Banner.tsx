import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCMS } from "@/hooks/useCMS";
import { DEFAULT_COMPANY } from "@/lib/site";
import { getPublicAppConfig } from "@/lib/runtime-config";

const DEFAULT_SLIDES = [
  {
    image: "/assets/banner4.png",
    title: "Regalos que trascienden",
    subtitle: "Historias reales de alegría en Guayaquil",
    cta: "Ver testimonios",
    href: "/#testimonios",
  },
  {
    image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?q=80&w=2000&auto=format&fit=crop",
    title: "Hoy haces su día especial",
    subtitle: "Entrega en Guayaquil en horas",
    cta: "Comprar ahora",
    href: "/shop",
  }
];

function normalizeHeroImageUrl(image: unknown) {
  const rawUrl =
    typeof image === "string"
      ? image
      : image && typeof image === "object" && "url" in image
        ? String((image as { url?: unknown }).url || "")
        : "";
  const url = rawUrl.trim();

  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const path = url.startsWith("/") ? url : `/${url}`;
  const { assetBaseUrl } = getPublicAppConfig();
  return assetBaseUrl ? `${assetBaseUrl}${path}` : path;
}

export function Banner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: cms, isLoading } = useCMS();

  // Mapear los datos del CMS al formato de slides
  const slides = React.useMemo(() => {
    if (!cms) return DEFAULT_SLIDES;
    
    const imageUrls = Array.isArray(cms.images)
      ? cms.images.map(normalizeHeroImageUrl).filter(Boolean)
      : [];
    
    if (imageUrls.length === 0) return DEFAULT_SLIDES;

    return imageUrls.map((img: string) => ({
      image: img,
      title: cms.title || "DIFIORI",
      subtitle: cms.description || "Diseñando emociones",
      cta: "Comprar ahora",
      href: "/shop",
    }));
  }, [cms]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides]);

  if (isLoading) {
    return (
      <div className="h-[78vh] min-h-[640px] md:h-[88vh] bg-[#111] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="relative h-[78vh] min-h-[640px] md:h-[88vh] bg-[#111] overflow-hidden group/banner">
      {/* Cinematic Crossfade Background */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence>
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {cms?.backgroundType === "video" && cms?.videoUrl ? (
              <video 
                src={cms.videoUrl} 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover grayscale-[0.2] brightness-[0.7]"
              />
            ) : (
              <motion.img 
                src={slides[selectedIndex].image} 
                alt={`Florería DIFIORI - ${slides[selectedIndex].title}`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 25, ease: "linear" }}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover object-center contrast-[1.15] saturate-[1.1] brightness-[0.85]"
              />
            )}
            {/* Base Overlay to guarantee text readability */}
            <div className="absolute inset-0 -z-10 bg-[#111]" />
            <img
              src={slides[selectedIndex].image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center blur-2xl scale-110 opacity-45"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/30 to-transparent opacity-90" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Static UI Overlay - Stays in place perfectly without bounds stretching */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-8 md:pb-10 z-20">
        
        {/* Vertical Slide Indicator - Left Side */}
        <div className="absolute left-10 lg:left-20 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-6 pointer-events-auto mix-blend-overlay">
          <span className="text-white/80 font-serif italic text-sm">
            {String(selectedIndex + 1).padStart(2, '0')}
          </span>
          <div className="w-[1px] h-24 bg-white/20 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-white transition-all duration-700"
              style={{ height: `${((selectedIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
          <span className="text-white/40 font-serif italic text-sm">
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        {/* Minimalist Top Tag */}
        <div className="hidden">
           <AnimatePresence mode="wait">
             <motion.div
               key={selectedIndex}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-4 px-6 py-2 border border-white/20 rounded-full backdrop-blur-md bg-white/5"
             >
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/90">
                 Colección {selectedIndex === 0 ? "Exclusiva" : "Temporada"}
               </span>
             </motion.div>
           </AnimatePresence>
        </div>
        
        <div className="relative z-20 w-full px-10 md:px-20 lg:px-40 pointer-events-auto">
          <div className="flex flex-col items-center md:items-start max-w-2xl gap-10">
            {/* Title Fade */}
             <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(10px)", y: -20 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center md:text-left"
                >
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-5 leading-none tracking-tight">
                    {slides[selectedIndex].title}
                  </h2>
                  <p className="text-white/60 font-serif italic text-xl md:text-2xl">
                    {slides[selectedIndex].subtitle}
                  </p>
                </motion.div>
             </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Link href={slides[selectedIndex].href} className="group relative flex min-h-[58px] min-w-[240px] items-center justify-center gap-4 overflow-hidden rounded-full bg-accent px-12 py-5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-[#3D2852]/30 transition-all hover:-translate-y-0.5 hover:bg-[#4A3362] hover:shadow-xl hover:shadow-[#3D2852]/35">
                <div className="absolute inset-0 translate-y-[100%] bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-y-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 flex items-center gap-4 text-white transition-colors duration-500"
                  >
                    {slides[selectedIndex].cta}
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </AnimatePresence>
              </Link>
              
              <a 
                href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-[#25D366]/30 bg-[#25D366] px-8 py-5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#1ebe5d] hover:shadow-[0_24px_52px_rgba(37,211,102,0.36)]"
              >
                <MessageCircle className="h-6 w-6" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Minimalist Progress Indicator (Mobile) */}
          <div className="md:hidden mt-10 flex justify-center gap-4 opacity-70">
             {slides.map((_, i) => (
               <button
                 key={i}
                 type="button"
                 aria-label={`Ver banner ${i + 1}`}
                 onClick={() => setSelectedIndex(i)}
                 className={cn(
                   "h-[1px] transition-all duration-1000", 
                   selectedIndex === i ? "w-12 bg-white" : "w-4 bg-white/30"
                 )} 
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
