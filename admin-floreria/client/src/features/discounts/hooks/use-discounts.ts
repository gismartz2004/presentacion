import { toast } from "sonner";
import discountsService from "../api/discount-service";
import { useState } from "react";
import type {
  DeleteDiscountResponse,
  Discount,
  DiscountType,
  GetDiscountsResponse,
  GetDiscountTypesResponse,
  Product as ProductDiscount,
  UpdateDiscountPayload,
  UpdateDiscountResponse,
} from "../types";
import axios from "axios";

export default function useDiscounts() {
  // Aquí irían los hooks relacionados con descuentos
  const [isLoading, setIsLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      // Lógica para obtener descuentos desde el servicio de descuentos
      const response: GetDiscountsResponse =
        await discountsService.get_all_discounts();

      const { message, data } = response;

      if (data) {
        console.log("Fetched discounts:", data);
        setDiscounts(data);
      } else {
        toast.error(message || "Error al cargar descuentos");
      }
    } catch (error: unknown) {
      console.error("Fetch discounts error:", error);
      toast.error("Error al cargar descuentos");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiscountProducts = async (
    discountId: number,
    productIds: string[],
    allProducts: ProductDiscount[]
  ) => {
    try {
      setIsLoading(true);
      const response = await discountsService.updateDiscountProducts(
        String(discountId),
        productIds
      );
      const { status, message } = response;

      if (status === "success") {
        toast.success("Productos actualizados correctamente");
        setDiscounts((prev) =>
          prev.map((discount) =>
            discount.id === discountId
              ? {
                  ...discount,
                  products: allProducts.filter((p) =>
                    productIds.includes(p.id)
                  ),
                }
              : discount
          )
        );
      } else {
        toast.error(message || "Error al actualizar productos del descuento");
      }
    } catch (error) {
      console.error("Update discount products error:", error);
      toast.error("Error de conexión al actualizar productos del descuento");
    } finally {
      setIsLoading(false);
    }
  };

  const getDiscountTypes = async () => {
    try {
      setIsLoading(true);
      const response: GetDiscountTypesResponse =
        await discountsService.getDiscountTypes();
      const { data, message } = response;

      if (data) {
        setDiscountTypes(data);
      } else {
        toast.error(message || "Error al cargar tipos de descuento");
      }
    } catch (error: unknown) {
      console.error("Get discount types error:", error);
      setIsLoading(false);
      toast.error("Error al cargar tipos de descuento");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiscounts = async (discountData: UpdateDiscountPayload) => {
    try {
      setIsLoading(true);
      const response: UpdateDiscountResponse =
        await discountsService.updateDiscounts(discountData);
      const { data, message, status } = response;

      if (data && status === "success") {
        toast.success("Descuento actualizado correctamente");
        // Actualizar el estado local si es necesario
        setDiscounts((prevDiscounts) =>
          prevDiscounts.map((discount) =>
            discount.id === data.id ? data : discount
          )
        );
      } else {
        toast.error(message || "Error al actualizar el descuento");
      }
    } catch (error: unknown) {
      console.error("Update discount error:", error);

      let message = "Error de conexión al actualizar el descuento";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiscount = async (id: number) => {
    try {
      setIsLoading(true);
      const response: DeleteDiscountResponse =
        await discountsService.deleteDiscount(id);
      const { data, message, status } = response;

      if (data && status === "success") {
        toast.success("Descuento eliminado correctamente");
        // Actualizar el estado local si es necesario
        setDiscounts(data);
      } else {
        toast.error(message || "Error al eliminar el descuento");
      }
    } catch (error) {
      let message = "Error de conexión al actualizar el descuento";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const insertDiscounts = async (
    discountData: Omit<UpdateDiscountPayload, "id">
  ) => {
    try {
      setIsLoading(true);
      const response: UpdateDiscountResponse =
        await discountsService.insertDiscounts(discountData);
      const { data, message, status } = response;

      if (data && status === "success") {
        toast.success("Descuento creado correctamente");
        // Actualizar el estado local si es necesario
        setDiscounts((prevDiscounts) => [...prevDiscounts, data]);
      } else {
        toast.error(message || "Error al crear el descuento");
      }
    } catch (error: unknown) {
      console.error("Insert discount error:", error);

      let message = "Error de conexión al crear el descuento";

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchDiscounts,
    isLoading,
    discountTypes,
    setIsLoading,
    discounts,
    updateDiscountProducts,
    getDiscountTypes,
    updateDiscounts,
    insertDiscounts,
    deleteDiscount,
  };
}
