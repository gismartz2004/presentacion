import React, { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { ChevronDown, Filter, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CategorySidebarProps {
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
}

export function CategorySidebar({ activeCategory, setActiveCategory }: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="w-full lg:w-72 flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const allCategories = categories || [];

  return (
    <div className="w-full lg:w-72 flex flex-col gap-6">
      {/* Mobile Dropdown */}
      <div className="lg:hidden w-full relative group">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white border border-primary/20 p-5 rounded-2xl shadow-lg font-black text-xs uppercase tracking-widest text-foreground transition-all active:scale-95"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-accent" />
            Categorías: <span className="text-accent text-[9px]">{activeCategory || "Todas"}</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 transition-transform duration-500", isOpen && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-white shadow-2xl border border-primary/20 rounded-2xl mt-3 z-40 overflow-hidden"
            >
              <button 
                className={cn(
                  "w-full text-left p-5 hover:bg-primary/10 transition-colors font-bold text-xs uppercase tracking-widest border-b border-primary/5",
                  activeCategory === null ? "text-accent bg-primary/5" : "text-foreground/60"
                )}
                onClick={() => {
                  setActiveCategory(null);
                  setIsOpen(false);
                }}
              >
                Todas las Colecciones
              </button>
              <button 
                className={cn(
                  "w-full text-left p-5 hover:bg-primary/10 transition-colors font-bold text-xs uppercase tracking-widest border-b border-primary/5",
                  activeCategory === "Más Vendidos" ? "text-accent bg-primary/5" : "text-foreground/60"
                )}
                onClick={() => {
                  setActiveCategory("Más Vendidos");
                  setIsOpen(false);
                }}
              >
                Más Vendidos
              </button>
              {allCategories.map((name) => (
                <button 
                  key={name} 
                  className={cn(
                    "w-full text-left p-5 hover:bg-primary/10 transition-colors font-bold text-xs uppercase tracking-widest border-b border-primary/5 last:border-0",
                    activeCategory === name ? "text-accent bg-primary/5" : "text-foreground/60"
                  )}
                  onClick={() => {
                    setActiveCategory(name);
                    setIsOpen(false);
                  }}
                >
                  {name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Vertical Sidebar */}
      <div className="hidden lg:flex flex-col gap-3 p-8 bg-white border border-primary/20 rounded-[3rem] shadow-xl sticky top-32">
        <h3 className="text-foreground font-serif font-bold text-2xl mb-8 px-2 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent" />
          Colecciones
        </h3>
        <div className="flex flex-col gap-2">
          <button 
            className={cn(
              "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-black text-[9px] uppercase tracking-widest flex items-center justify-between group relative overflow-hidden",
              activeCategory === null
                ? "bg-primary/20 text-accent shadow-sm" 
                : "text-foreground/40 hover:bg-primary/10 hover:text-foreground/80 border border-transparent"
            )}
            onClick={() => setActiveCategory(null)}
          >
            <span className="relative z-10">Todas las Colecciones</span>
            <div className={cn(
              "w-1 h-1 rounded-full transition-all duration-500 relative z-10",
              activeCategory === null ? "bg-accent scale-150" : "bg-primary group-hover:scale-125"
            )}></div>
          </button>
          
          <button 
            className={cn(
              "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-black text-[9px] uppercase tracking-widest flex items-center justify-between group relative overflow-hidden",
              activeCategory === "Más Vendidos"
                ? "bg-primary/20 text-accent shadow-sm" 
                : "text-foreground/40 hover:bg-primary/10 hover:text-foreground/80 border border-transparent"
            )}
            onClick={() => setActiveCategory("Más Vendidos")}
          >
            <span className="relative z-10">Más Vendidos</span>
            <div className={cn(
              "w-1 h-1 rounded-full transition-all duration-500 relative z-10",
              activeCategory === "Más Vendidos" ? "bg-accent scale-150" : "bg-primary group-hover:scale-125"
            )}></div>
          </button>
          
          {allCategories.map((name) => (
            <button 
              key={name} 
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-black text-[9px] uppercase tracking-widest flex items-center justify-between group relative overflow-hidden",
                activeCategory === name 
                  ? "bg-primary/20 text-accent shadow-sm" 
                  : "text-foreground/40 hover:bg-primary/10 hover:text-foreground/80 border border-transparent"
              )}
              onClick={() => setActiveCategory(name)}
            >
              <span className="relative z-10">{name}</span>
              <div className={cn(
                "w-1 h-1 rounded-full transition-all duration-500 relative z-10",
                activeCategory === name ? "bg-accent scale-150" : "bg-primary group-hover:scale-125"
              )}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
