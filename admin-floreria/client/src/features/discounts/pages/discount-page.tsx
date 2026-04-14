import { useEffect } from "react";
import useDiscounts from "../hooks/use-discounts";
import Loading from "@/shared/components/loading";
import DiscountCard from "../components/discount-card";
import { Input } from "@/shared/components/ui/input";
import { DiscountFormModal } from "../components/discount-form-modal";

export default function DiscountsPage() {
  const {
    fetchDiscounts,
    isLoading,
    discounts,
    discountTypes,
    updateDiscountProducts,
    getDiscountTypes,
    updateDiscounts,
    insertDiscounts,
    deleteDiscount
  } = useDiscounts();

  useEffect(() => {
    fetchDiscounts();
    getDiscountTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="gap-4 md:gap-6 py-4 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2 mt-1">
        <div>
          <h2 className="text-2xl font-bold">Descuentos</h2>
          <p className="text-gray-600">
            Gestiona los descuentos de tu negocio
          </p>
        </div>
      </div>

      <div className="flex items-center mt-4">
        <Input
          placeholder="Buscar productos..."
          // value={"search"}
          // onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex-1" />
        <DiscountFormModal // enviamos los datos actuales
            onSave={insertDiscounts}
            trigger={
                <button
                    className="bg-white text-gray-700 p-2 rounded-md border border-gray-200 hover:bg-gray-50 
                            flex items-center justify-center"
                >
                    Crear descuento
                </button>
            }
            discountTypes={discountTypes}
        />
      </div>
      {/* Divisor */}
      <hr className="my-4 border-gray-300" />

      {discounts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron descuentos</p>
        </div>
      )}

      <div className="overflow-y-auto mt-4 pt-2 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <DiscountCard
              discountTypes={discountTypes}
              updateDiscountProducts={updateDiscountProducts}
              discount={discount}
              isLoadingProp={isLoading}
              key={discount.id}
              updateDiscounts={updateDiscounts}
              deleteDiscount={deleteDiscount}
            />
          ))}
        </div>
      </div>
    </div>
  )
}