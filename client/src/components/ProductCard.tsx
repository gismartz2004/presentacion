import React from "react";
import { Product } from "@/data/mock";
import { Link } from "wouter";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { buyNow } = useCart();

  const handleBuyNow = () => {
    buyNow(product);
    window.location.href = "/checkout"; // Safe navigation bypassing Wouter re-renders causing hook conflicts
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/20 flex flex-col justify-between"
      itemScope itemType="https://schema.org/Product"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        <img 
          itemProp="image"
          src={product.image} 
          alt={`${product.name} - Florería DIFIORI Guayaquil`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
        
        {product.isBestSeller && (
          <div className="absolute top-6 left-6 z-10 bg-accent text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            Más Vendido
          </div>
        )}
      </Link>
      
      <div className="p-8 text-center flex flex-col items-center flex-1">
        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3">
          {product.category}
        </span>
        <h3 itemProp="name" className="text-2xl font-serif font-bold text-foreground mb-3 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-2 mb-6 opacity-60">
           <span className="text-[9px] font-bold uppercase tracking-wider bg-muted px-3 py-1 rounded-full">{product.size}</span>
           <span className="text-[9px] font-bold uppercase tracking-wider bg-muted px-3 py-1 rounded-full">🕒 {product.deliveryTime}</span>
        </div>

        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="price" content={product.price.replace("$", "")} />
          <p className="text-3xl font-black text-foreground mb-8 mt-auto">
            {product.price}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button onClick={handleBuyNow} className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
            Comprar Ahora
          </button>
          <a 
            href={`https://wa.me/593987654321?text=Hola!%20Me%20interesa%20el%20producto%20${encodeURIComponent(product.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-accent/10 hover:bg-accent text-accent hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-accent/20 flex items-center justify-center gap-2"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
