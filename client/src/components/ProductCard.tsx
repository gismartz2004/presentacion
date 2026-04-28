import React from "react";
import type { Product } from "@/data/mock";
import { Link } from "wouter";
import { Loader2, MessageSquare, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { DEFAULT_COMPANY } from "@/lib/site";
import { formatCategoryDisplayName, getProductPath } from "@shared/catalog";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { buyNow } = useCart();
  const [isBuying, setIsBuying] = React.useState(false);
  const categoryLabel = formatCategoryDisplayName(product.category);

  const handleBuyNow = () => {
    if (isBuying) return;
    setIsBuying(true);
    buyNow(product);
    window.location.href = "/checkout"; // Safe navigation bypassing Wouter re-renders causing hook conflicts
  };

  return (
    <article
      className="surface-card group flex h-full flex-col overflow-hidden border-[#DECDF0] transition-all duration-500"
      itemScope itemType="https://schema.org/Product"
    >
      <Link
        href={getProductPath(product)}
        className="relative block aspect-square overflow-hidden border-b border-primary/20 bg-white"
      >
        <img 
          itemProp="image"
          src={product.image} 
          alt={`${product.name} - Florería DIFIORI Guayaquil`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
          className="h-full w-full object-contain object-center"
        />
        
        {product.isBestSeller && (
          <div className="absolute top-6 left-6 z-10 bg-accent text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            Más Vendido
          </div>
        )}
      </Link>
      
      <div className="flex flex-1 flex-col items-center p-6 text-center sm:p-7">
        <span className="text-[10px] font-black text-[#4A3362] uppercase tracking-[0.2em] mb-3">
          {categoryLabel}
        </span>
        <h3 itemProp="name" className="mb-3 font-serif text-[2rem] font-bold leading-tight text-[#4A3362]">
          {product.name}
        </h3>
        
        {/* <div className="flex flex-wrap justify-center gap-2 mb-6 opacity-60">
           {product.size && (
             <span className="rounded-full bg-muted px-3 py-1 text-[9px] font-bold uppercase tracking-wider">{product.size}</span>
           )}
        </div> */}

        <div className="mt-auto" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="price" content={product.price.replace("$", "")} />
          <p className="mb-7 text-3xl font-black text-foreground">
            {product.price}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button type="button" onClick={handleBuyNow} disabled={isBuying} className="ui-btn-primary w-full">
            {isBuying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            {isBuying ? "Cargando..." : "Comprar Ahora"}
          </button>
          <a 
            href={`https://wa.me/${DEFAULT_COMPANY.phoneDigits}?text=Hola!%20Me%20interesa%20el%20producto%20${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-btn-secondary w-full"
          >
            <MessageSquare className="h-4 w-4" />
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
