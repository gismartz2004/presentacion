import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShoppingBag, Menu, X, Search, Loader2 } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { DEFAULT_COMPANY } from "@/lib/site";

const SearchOverlay = lazy(() =>
  import("@/components/SearchOverlay").then((module) => ({ default: module.SearchOverlay })),
);

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartNavigating, setIsCartNavigating] = useState(false);
  const { cartItemCount } = useCart();

  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
    setIsCartNavigating(false);
  }, [location]);

  const handleCartNavigation = () => {
    if (isCartNavigating || location === "/checkout") return;
    setIsCartNavigating(true);
    setLocation("/checkout");
  };

  const leftLinks = [
    { href: "/#catalogo", label: "Catálogo" },
    { href: "/#faq", label: "Preguntas" },
  ];

  const rightLinks = [
    { href: "/#testimonios", label: "Testimonios" },
    { href: "/#contacto", label: "Contacto" },
  ];

  return (
    <>
      <Suspense fallback={null}>
        {isSearchOpen && <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      </Suspense>

      <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-white py-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-1000 lg:py-7 min-[1440px]:py-8">
        <div className="mx-auto w-full px-6 lg:px-8 min-[1440px]:px-12">
          <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_clamp(190px,16vw,260px)_minmax(0,1fr)] items-center gap-3 min-[1440px]:gap-5">
            <div className="flex min-w-0 items-center justify-start gap-5 min-[1440px]:gap-10">
              {leftLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "group relative whitespace-nowrap text-[clamp(0.95rem,1.05vw,1.08rem)] font-black uppercase tracking-[0.14em] transition-all duration-500 min-[1440px]:tracking-[0.18em] min-[1600px]:text-[1.14rem]",
                    "text-foreground hover:text-accent",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-1/2 h-[1px] w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-full",
                      "bg-accent/40",
                    )}
                  />
                </a>
              ))}
            </div>

            <div className="flex min-w-0 items-center justify-center">
              <Link href="/" className="group flex w-full items-center justify-center overflow-visible">
                <Logo
                  size="md"
                  variant="dark"
                  className="w-full max-w-[230px] scale-95 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] min-[1440px]:max-w-[260px] min-[1440px]:scale-100"
                />
              </Link>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-5 min-[1440px]:gap-10">
              {rightLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "group relative hidden whitespace-nowrap text-[clamp(0.95rem,1.05vw,1.08rem)] font-black uppercase tracking-[0.14em] transition-all duration-500 xl:block min-[1440px]:tracking-[0.18em] min-[1600px]:text-[1.14rem]",
                    "text-foreground hover:text-accent",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-1/2 h-[1px] w-0 -translate-x-1/2 transition-all duration-500 group-hover:w-full",
                      "bg-accent/40",
                    )}
                  />
                </a>
              ))}

              <div
                className="flex shrink-0 items-center gap-4 border-l pl-4 transition-colors duration-500 min-[1440px]:gap-8 min-[1440px]:pl-8"
                style={{
                  borderLeftColor: "rgba(0,0,0,0.1)",
                }}
              >
                <button
                  type="button"
                  aria-label="Buscar productos"
                  onClick={() => setIsSearchOpen(true)}
                  className={cn(
                    "transition-all hover:scale-110",
                    "text-foreground hover:text-accent",
                  )}
                >
                  <Search className="h-6 w-6 min-[1440px]:h-7 min-[1440px]:w-7" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label={`Ver carrito (${cartItemCount})`}
                  onClick={handleCartNavigation}
                  disabled={isCartNavigating}
                  className={cn(
                    "relative flex items-center gap-2 transition-all hover:scale-110 disabled:pointer-events-none disabled:opacity-70",
                    "text-foreground hover:text-accent",
                  )}
                >
                  {isCartNavigating ? (
                    <Loader2 className="h-6 w-6 animate-spin min-[1440px]:h-7 min-[1440px]:w-7" strokeWidth={2} />
                  ) : (
                    <ShoppingBag className="h-6 w-6 min-[1440px]:h-7 min-[1440px]:w-7" strokeWidth={2} />
                  )}
                  <span className="translate-y-[2px] text-xs font-black tracking-widest min-[1440px]:text-sm">({cartItemCount})</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between lg:hidden">
            <button
              type="button"
              aria-label="Abrir menú"
              className={cn("p-1 transition-colors", "text-foreground")}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-8 w-8" strokeWidth={2} />
            </button>

            <Link href="/" className="absolute left-1/2 flex items-center -translate-x-1/2">
              <Logo size="sm" variant="dark" />
            </Link>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Buscar productos"
                onClick={() => setIsSearchOpen(true)}
                className={cn("p-1 transition-colors", "text-foreground")}
              >
                <Search className="h-7 w-7" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label={`Ver carrito (${cartItemCount})`}
                onClick={handleCartNavigation}
                disabled={isCartNavigating}
                className={cn(
                  "relative p-1 transition-colors hover:scale-110 disabled:pointer-events-none disabled:opacity-70",
                  "text-foreground",
                )}
              >
                {isCartNavigating ? (
                  <Loader2 className="h-7 w-7 animate-spin" strokeWidth={2} />
                ) : (
                  <ShoppingBag className="h-7 w-7" strokeWidth={2} />
                )}
                {cartItemCount > 0 && !isCartNavigating ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#fff] bg-accent text-[10px] font-black text-white shadow-lg">
                    {cartItemCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="fixed inset-0 z-[100] flex h-screen w-full flex-col bg-background/95 p-8 backdrop-blur-3xl lg:hidden"
            >
              <div className="mb-16 flex items-center justify-between">
                <Logo size="sm" variant="dark" />
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  className="p-2 text-foreground/50 transition-colors hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-8 flex flex-col items-center gap-8 text-center">
                {[...leftLinks, ...rightLinks].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-3xl font-serif italic text-foreground/80 transition-colors hover:text-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      <a
        href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group fixed bottom-8 right-8 z-[100] flex h-[60px] w-[60px] items-center justify-center rounded-full border border-white/20 bg-[#25D366] shadow-[0_20px_50px_rgba(37,211,102,0.35)] transition-colors duration-300 hover:bg-[#1ebe5d] hover:shadow-[0_24px_54px_rgba(37,211,102,0.4)]"
      >
        <div className="relative flex h-7 w-7 items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full drop-shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="white"
              d="M12.031 0C5.39 0 0 5.385 0 12.028a11.96 11.96 0 001.597 6.036L0 24l6.117-1.605a11.968 11.968 0 005.918 1.564c6.64 0 12.03-5.388 12.03-12.031C24.065 5.385 18.671 0 12.031 0z"
            />
            <path
              fill="#25D366"
              d="M17.362 14.156c-.292-.146-1.728-.853-1.996-.95-.264-.097-.456-.145-.648.145-.192.29-.74.922-.907 1.114-.167.19-.334.213-.626.067-.282-.143-1.222-.45-2.328-1.435-.86-.767-1.437-1.716-1.606-2.008-.168-.291-.018-.45.126-.595.13-.133.292-.34.437-.51.144-.17.191-.291.286-.485.096-.194.048-.363-.024-.51-.07-.145-.648-1.562-.888-2.14-.23-.559-.47-.48-.648-.49-.168-.008-.36-.01-.55-.01s-.51.074-.77.345c-.26.29-1 .976-1 2.428s1.026 2.85 1.17 3.045c.145.195 2.02 3.084 4.89 4.33.682.296 1.215.474 1.63.606.69.219 1.317.187 1.815.113.553-.081 1.73-.705 1.972-1.385.242-.68.242-1.262.17-1.385-.078-.124-.282-.195-.572-.34z"
            />
          </svg>
        </div>
      </a>
    </>
  );
}
