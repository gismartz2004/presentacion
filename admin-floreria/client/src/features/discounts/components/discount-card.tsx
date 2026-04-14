import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { Discount, DiscountType, UpdateDiscountPayload } from "../types";
import { DiscountProductsModal } from "./discount-products-modal";
import useProducts from "@/features/products/hooks/use-products";
import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import type { Product as ProductProducts } from "@/features/products/types";
import type { Product as ProductDiscount } from "@/features/discounts/types";
import { DiscountFormModal } from "./discount-form-modal";
type DiscountCardProps = {
  discount: Discount;
  isLoadingProp: boolean;
  discountTypes: DiscountType[];
  updateDiscounts: (discountData: UpdateDiscountPayload) => void;
  deleteDiscount: (id: number) => void;
  updateDiscountProducts: (
    discountId: number,
    productIds: string[],
    allProducts: ProductDiscount[]
  ) => void;
};

function mapToDiscountProduct(p: ProductProducts): ProductDiscount {
  return {
    id: p.id,
    name: p.name,
    image: p.image ?? "",
    price: p.price ?? 0, // Garantizado, porque en discounts es obligatorio
  };
}

export default function DiscountCard({
  discount,
  updateDiscountProducts,
  isLoadingProp,
  discountTypes,
  updateDiscounts,
  deleteDiscount,
}: DiscountCardProps) {
  // Estado local para los productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    discount.products.map((p) => p.id)
  );

  // Tu custom hook
  const { products, isLoading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts(); // solo se ejecuta una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const discountProducts = (products ?? []).map(mapToDiscountProduct);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  return (
    <Card className="py-0 flex flex-col h-full">
      <div className="relative w-full overflow-hidden rounded-t-lg flex-shrink-0">
        <div
          className="bg-red-800 text-white py-4 text-4xl sm:text-5xl font-bold 
                    flex items-center justify-center 
                    rounded-t-lg w-full h-24 sm:h-28"
        >
          {discount.percent}%
        </div>
      </div>

      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <CardTitle className="text-sm sm:text-base text-center leading-tight line-clamp-2 min-h-[2.5rem]">
          {discount.description}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex flex-col flex-1">
          <div className="flex flex-row items-start mb-8">
            <p className="text-xs sm:text-sm text-gray-300 mr-1">Tipo:</p>
            <p className="text-xs sm:text-sm text-gray-500">
              {discount.discount_types.type_name}
            </p>
          </div>

          <div className="flex flex-col gap-1 mb-6">
            {discount.discount_types.id !== 2 &&
              <div className="flex flex-row items-start">
                <p className="text-xs sm:text-sm text-gray-300 mr-1">Vigencia:</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatDate(discount.starts_at)} →{" "}
                  {formatDate(discount.ends_at)}
                </p>
              </div>
            }

            {discount.code && (
              <div className="flex flex-row items-start">
                <p className="text-xs sm:text-sm text-gray-300 mr-1">Código:</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {discount.code}
                </p>
              </div>
            )}

            {typeof discount.uses === "number" && (
              <div className="flex flex-row items-start">
                <p className="text-xs sm:text-sm text-gray-300 mr-1">Usos:</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {discount.uses}
                  {discount.max_uses != null ? ` / ${discount.max_uses}` : ""}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="flex flex-row items-around gap-3 mb-2">
              {selectedProducts.length > 0 && (
                <DiscountProductsModal
                  selected={selectedProducts}
                  setSelected={setSelectedProducts}
                  allProducts={discountProducts}
                  isLoading={isLoading}
                  isLoadingUpdate={isLoadingProp}
                  onSave={updateDiscountProducts}
                  discountId={discount.id}
                />
              )}

              <button onClick={() => deleteDiscount(discount.id)}
                className="bg-red-800 text-gray-50 p-4 rounded-md border border-red-700 hover:bg-red-600 
                                            flex items-center justify-center"
              >
                <Trash className="w-4 h-4 text-gray-50" />
              </button>

              <DiscountFormModal
                updateDiscounts={updateDiscounts}
                discount={discount}
                trigger={
                  <button
                    className="bg-white text-gray-700 p-4 rounded-md border border-gray-200 hover:bg-gray-50 
                                                flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                }
                discountTypes={discountTypes}
              />
            </div>

            {discount.products.length === 0 &&
              discount.discount_types.id === 1 && (
                <DiscountProductsModal
                  selected={selectedProducts}
                  setSelected={setSelectedProducts}
                  allProducts={discountProducts}
                  isLoading={isLoading}
                  isLoadingUpdate={isLoadingProp}
                  onSave={updateDiscountProducts}
                  discountId={discount.id}
                />
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
