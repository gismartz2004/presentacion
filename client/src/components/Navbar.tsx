import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/shop", label: "Tienda" },
    { href: "/contact", label: "Contacto" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500 py-4",
      scrolled ? "bg-white/70 backdrop-blur-2xl border-b border-border/40 shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">A</div>
          <span className="text-2xl font-serif font-bold tracking-tighter text-primary">
            AESTHETICA
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-semibold tracking-wide nav-link-hover transition-colors",
                  location === link.href ? "text-accent" : "text-primary/70 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 pl-8 border-l border-border/60">
            <button className="p-2 text-primary/70 hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-primary/70 hover:text-accent transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-[10px] text-white flex items-center justify-center rounded-full">2</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-3xl border-b border-border p-8 flex flex-col gap-6"
          >
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-xl font-bold",
                  location === link.href ? "text-accent" : "text-primary"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
