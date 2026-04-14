import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/core/utils/variables";
import type { Product } from "../types";
import Loading from "@/shared/components/loading";
import { Button } from "@/shared/components/ui/button";

type Props = {
  allProducts: Product[];
  selected: string[];
  setSelected: (ids: string[]) => void;
  isLoading: boolean;
  isLoadingUpdate: boolean;
  discountId: number;
  onSave: (discountId: number, productIds: string[], allProducts: Product[]) => void;
};

export function DiscountProductsModal({
  allProducts,
  selected,
  isLoading,
  onSave,
  discountId,
  isLoadingUpdate,
}: Props) {

  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    setSelectedProducts(selected);
  }, [selected]);

  const sortedProducts = [
    ...allProducts.filter((p) => selectedProducts.includes(p.id)),
    ...allProducts.filter((p) => !selectedProducts.includes(p.id)),
  ];

  // 4️⃣ Seleccionar/deseleccionar
  const toggleSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async () => {
    await onSave(discountId, selectedProducts, allProducts);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full bg-white text-gray-700 py-2 rounded-md border border-gray-200 hover:bg-gray-50">
          {selectedProducts.length === 0 ? "Agregar productos" :"Ver productos"}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Seleccionar productos</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center py-5 text-sm text-gray-500">
            Cargando productos...
          </p>
        ) : isLoadingUpdate ? (
          <div className="flex items-center justify-center h-32">
            <Loading />
          </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pt-3">
              {sortedProducts.map((p) => {
                const isSelected = selectedProducts.includes(p.id);
  
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`border rounded-lg p-3 h-full flex flex-col items-center text-center cursor-pointer transition justify-between
                      ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-md mb-2"
                      />

                      <p className="text-xs font-medium line-clamp-2 min-h-[2.5rem]">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">${p.price}</p>
                    </div>

                    <div className="mt-2 min-h-[1.5rem] flex items-center">
                      {isSelected ? (
                        <span className="py-0.5 px-2 text-xs bg-blue-500 text-white rounded-full">
                          Seleccionado
                        </span>
                      ) : (
                        <span className="py-0.5 px-2 text-xs rounded-full opacity-0 select-none">
                          Seleccionado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        <div className="pt-4 flex justify-end">
          {/* <button onClick={handleSave} className="text-white px-4 py-2 rounded-md">
            Guardar
          </button> */}
          <Button onClick={handleSave} disabled={isLoading || isLoadingUpdate}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
