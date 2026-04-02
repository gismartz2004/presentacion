import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Menu, X, MessageSquare, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { cartItemCount, setIsCartOpen } = useCart();

  const leftLinks = [
    { href: "#mas-vendidos", label: "Más Vendidos" },
    { href: "#catalogo", label: "Catálogo" },
  ];

  const rightLinks = [
    { href: "#testimonios", label: "Testimonios" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <>
      <nav className={cn(
        "fixed w-full top-0 z-50 transition-all duration-1000",
        scrolled ? "bg-white/90 backdrop-blur-3xl border-b border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] py-3 lg:py-4" : "bg-transparent py-6 lg:py-8"
      )}>
        <div className="container mx-auto px-6 lg:px-12">
          {/* Main Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 items-center">
            
            {/* Left Menu */}
            <div className="flex items-center gap-10 justify-start">
              {leftLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href}
                  className={cn(
                    "text-xs uppercase font-bold tracking-[0.25em] transition-all duration-500 relative group",
                    scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] transition-all duration-500 group-hover:w-full",
                    scrolled ? "bg-accent/40" : "bg-white/60"
                  )}></span>
                </a>
              ))}
            </div>

            {/* Center Logo */}
            <div className="flex justify-center items-center">
              <Link href="/" className="group flex items-center">
                 <Logo 
                   size={scrolled ? "sm" : "md"} 
                   variant={scrolled ? "dark" : "light"}
                   className="transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                 />
              </Link>
            </div>

            {/* Right Menu & Icons */}
            <div className="flex items-center gap-10 justify-end">
              {rightLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href}
                  className={cn(
                    "text-xs uppercase font-bold tracking-[0.25em] transition-all duration-500 relative group hidden xl:block",
                    scrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] transition-all duration-500 group-hover:w-full",
                    scrolled ? "bg-accent/40" : "bg-white/60"
                  )}></span>
                </a>
              ))}

              <div className="flex items-center gap-6 border-l pl-8 transition-colors duration-500" style={{ borderLeftColor: scrolled ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}>
                <button className={cn("transition-all hover:scale-110", scrolled ? "text-foreground/80 hover:text-accent" : "text-white/90 hover:text-white")}>
                  <Search className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <Link href="/checkout">
                  <button className={cn(
                    "relative transition-all hover:scale-110 flex items-center gap-2",
                    scrolled ? "text-foreground/80 hover:text-accent" : "text-white/90 hover:text-white"
                  )}>
                    <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-xs font-medium tracking-widest">({cartItemCount})</span>
                  </button>
                </Link>
              </div>
            </div>

          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between">
            <button 
              className={cn("p-1 transition-colors", scrolled ? "text-foreground" : "text-white")}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <Link href="/" className="flex items-center absolute left-1/2 -translate-x-1/2">
               <Logo size="sm" variant={scrolled ? "dark" : "light"} />
            </Link>

            <Link href="/checkout">
              <button className={cn(
                "relative p-1 transition-colors hover:scale-110",
                scrolled ? "text-foreground" : "text-white"
              )}>
                <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-[9px] text-white flex items-center justify-center rounded-full font-black shadow-sm">{cartItemCount}</span>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Fullscreen Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="lg:hidden fixed inset-0 h-screen w-full bg-background/95 backdrop-blur-3xl p-8 flex flex-col z-[100]"
            >
              <div className="flex justify-between items-center mb-16">
                 <Logo size="sm" variant="dark" />
                 <button 
                  className="text-foreground/50 hover:text-foreground transition-colors p-2"
                  onClick={() => setIsOpen(false)}
                 >
                  <X strokeWidth={1.5} />
                 </button>
              </div>
              
              <div className="flex flex-col gap-8 items-center text-center mt-8">
                {[...leftLinks, ...rightLinks].map((link) => (
                  <a 
                    key={link.label} 
                    href={link.href}
                    className="text-2xl font-serif italic text-foreground/80 hover:text-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Fixed WhatsApp Button */}
      <motion.a 
        initial={{ opacity: 0, y: 30, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ scale: 1.1, y: -10 }}
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/5930997984583" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-accent w-[60px] h-[60px] rounded-full shadow-[0_20px_50px_rgba(90,63,115,0.4)] hover:shadow-[0_30px_60px_rgba(90,63,115,0.6)] transition-all duration-700 flex items-center justify-center group border border-white/10"
      >
        <div className="relative w-7 h-7 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full drop-shadow-lg" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fill="white" 
              d="M12.031 0C5.39 0 0 5.385 0 12.028a11.96 11.96 0 001.597 6.036L0 24l6.117-1.605a11.968 11.968 0 005.918 1.564c6.64 0 12.03-5.388 12.03-12.031C24.065 5.385 18.671 0 12.031 0z"
            />
            <path 
              fill="#5A3F73" 
              d="M17.362 14.156c-.292-.146-1.728-.853-1.996-.95-.264-.097-.456-.145-.648.145-.192.29-.74.922-.907 1.114-.167.19-.334.213-.626.067-.282-.143-1.222-.45-2.328-1.435-.86-.767-1.437-1.716-1.606-2.008-.168-.291-.018-.45.126-.595.13-.133.292-.34.437-.51.144-.17.191-.291.286-.485.096-.194.048-.363-.024-.51-.07-.145-.648-1.562-.888-2.14-.23-.559-.47-.48-.648-.49-.168-.008-.36-.01-.55-.01s-.51.074-.77.345c-.26.29-1 .976-1 2.428s1.026 2.85 1.17 3.045c.145.195 2.02 3.084 4.89 4.33.682.296 1.215.474 1.63.606.69.219 1.317.187 1.815.113.553-.081 1.73-.705 1.972-1.385.242-.68.242-1.262.17-1.385-.078-.124-.282-.195-.572-.34z"
            />
          </svg>
        </div>
      </motion.a>
    </>
  );
}

