import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCMS } from "@/hooks/useCMS";

const DEFAULT_SLIDES = [
  {
    image: "/assets/banner4.png",
    title: "Regalos que trascienden",
    subtitle: "Historias reales de alegría en Guayaquil",
    cta: "Ver testimonios",
  },
  {
    image: "https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?q=80&w=2000&auto=format&fit=crop",
    title: "Hoy haces su día especial",
    subtitle: "Entrega en Guayaquil en horas",
    cta: "Comprar ahora",
  }
];

export function Banner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: cms, isLoading } = useCMS();

  // Mapear los datos del CMS al formato de slides
  const slides = React.useMemo(() => {
    if (!cms) return DEFAULT_SLIDES;
    
    const imageUrls = Array.isArray(cms.images) ? cms.images : [];
    
    if (imageUrls.length === 0) return DEFAULT_SLIDES;

    return imageUrls.map((img: string) => ({
      image: img,
      title: cms.title || "DIFIORI",
      subtitle: cms.description || "Diseñando emociones",
      cta: "Comprar ahora"
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
      <div className="h-[85vh] md:h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] md:h-screen bg-[#111] overflow-hidden group/banner">
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
                className="w-full h-full object-cover object-center contrast-[1.15] saturate-[1.1] brightness-[0.85]"
              />
            )}
            {/* Base Overlay to guarantee text readability */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/30 to-transparent opacity-90" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Static UI Overlay - Stays in place perfectly without bounds stretching */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-12 z-20">
        
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
        <div className="absolute top-32 left-1/2 -translate-x-1/2 md:left-20 md:-translate-x-0 w-full md:w-auto text-center md:text-left z-30 pointer-events-auto">
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
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-none tracking-tight">
                    {slides[selectedIndex].title}
                  </h2>
                  <p className="text-white/60 font-serif italic text-xl md:text-2xl">
                    {slides[selectedIndex].subtitle}
                  </p>
                </motion.div>
             </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/30 text-white px-12 py-5 rounded-none font-bold text-xs uppercase tracking-[0.3em] transition-all hover:border-white shadow-2xl flex items-center gap-4 justify-center min-w-[240px]">
                <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 flex items-center gap-4 group-hover:text-black transition-colors duration-500"
                  >
                    {slides[selectedIndex].cta}
                  </motion.span>
                </AnimatePresence>
              </button>
              
              <a 
                href="https://wa.me/5930997984583" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-white hover:text-white/70 transition-colors uppercase font-bold text-[10px] tracking-[0.4em]"
              >
                <div className="w-10 h-[1px] bg-white/40 group-hover:w-16 transition-all duration-500" />
                Asesoría WhatsApp
              </a>
            </div>
          </div>

          {/* Minimalist Progress Indicator (Mobile) */}
          <div className="md:hidden mt-16 flex justify-center gap-4 opacity-70">
             {slides.map((_, i) => (
               <button
                 key={i}
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
