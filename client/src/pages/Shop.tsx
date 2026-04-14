import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";

export default function Shop() {
  const { data: allProducts = [], isLoading } = useProducts();

  return (
    <div className="min-h-screen pt-40 px-6 md:px-20 max-w-7xl mx-auto">
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-[1px] bg-accent/30"></div>
          <span className="text-accent font-black uppercase tracking-[0.4em] text-[10px]">Tienda Oficial</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-serif text-foreground mb-4 italic">Nuestro Catálogo</h1>
        <p className="text-foreground/50 font-serif italic text-xl">Arreglos florales diseñados para trascender.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-96 bg-primary/5 animate-pulse rounded-[3rem]" />
          ))
        ) : allProducts.length > 0 ? (
          allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-40 text-center">
             <p className="text-foreground/40 font-serif italic text-2xl">No hay productos disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
