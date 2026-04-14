import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Percent, DollarSign, Gift, Truck } from "lucide-react";
import service from "@/core/api/service";
import {
  promotionsService,
  type CreatePromotionDto,
} from "../services/promotions-services";

interface PromotionType {
  PERCENTAGE: "PERCENTAGE";
  FIXED_AMOUNT: "FIXED_AMOUNT";
  BUY_X_GET_Y: "BUY_X_GET_Y";
  FREE_SHIPPING: "FREE_SHIPPING";
}

interface Product {
  id: string;
  name: string;
  price: number;
}

const promotionTypes = [
  {
    value: "PERCENTAGE",
    label: "Descuento Porcentual",
    description: "Ej: 20% de descuento",
    icon: Percent,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "FIXED_AMOUNT",
    label: "Descuento por Monto Fijo",
    description: "Ej: $10 de descuento",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "BUY_X_GET_Y",
    label: "Compra X Lleva Y",
    description: "Ej: 2x1, 3x2",
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    value: "FREE_SHIPPING",
    label: "Envio Gratis",
    description: "Sin costo de envio",
    icon: Truck,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
] as const;

export default function PromotionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PERCENTAGE" as keyof PromotionType,
    value: 0,
    buyQuantity: undefined as number | undefined,
    getQuantity: undefined as number | undefined,
    startsAt: "",
    endsAt: "",
    minQuantity: undefined as number | undefined,
    minAmount: undefined as number | undefined,
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchPromotion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await service.get("/products");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      const promotion = await promotionsService.findOne(id!);
      const isBuyXGetY = promotion.type === "BUY_X_GET_Y";

      setFormData({
        name: promotion.name,
        description: promotion.description || "",
        type: promotion.type as keyof PromotionType,
        value: isBuyXGetY ? 0 : promotion.value,
        buyQuantity: isBuyXGetY
          ? (promotion.buyQuantity ?? promotion.value)
          : undefined,
        getQuantity: isBuyXGetY
          ? (promotion.getQuantity ?? promotion.minQuantity)
          : undefined,
        startsAt: new Date(promotion.startsAt).toISOString().slice(0, 16),
        endsAt: promotion.endsAt
          ? new Date(promotion.endsAt).toISOString().slice(0, 16)
          : "",
        minQuantity: isBuyXGetY ? undefined : promotion.minQuantity,
        minAmount: promotion.minAmount,
        isActive: promotion.isActive,
      });

      setSelectedProducts(promotion.products.map((p) => p.productId));
    } catch (error) {
      console.error("Error fetching promotion:", error);
      toast.error("Error al cargar la promocion");
      navigate("/app/promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Debes ingresar un nombre");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Debes seleccionar al menos un producto");
      return;
    }

    if (!formData.startsAt) {
      toast.error("Debes especificar una fecha de inicio");
      return;
    }

    if (formData.type === "BUY_X_GET_Y") {
      if (
        !formData.buyQuantity ||
        !formData.getQuantity ||
        formData.buyQuantity < 1 ||
        formData.getQuantity < 1
      ) {
        toast.error("Debes ingresar cantidades validas para compra y lleva");
        return;
      }
    }

    if (
      (formData.type === "PERCENTAGE" || formData.type === "FIXED_AMOUNT") &&
      formData.value <= 0
    ) {
      toast.error("El valor del descuento debe ser mayor que 0");
      return;
    }

    if (formData.type === "PERCENTAGE" && formData.value > 100) {
      toast.error("El porcentaje no puede ser mayor a 100");
      return;
    }

    try {
      setLoading(true);

      const payload: CreatePromotionDto = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt
          ? new Date(formData.endsAt).toISOString()
          : undefined,
        productIds: selectedProducts,
        isActive: formData.isActive,
      };

      if (formData.type === "BUY_X_GET_Y") {
        payload.buyQuantity = formData.buyQuantity;
        payload.getQuantity = formData.getQuantity;
      } else if (formData.type === "FREE_SHIPPING") {
        payload.value = 0;
        payload.minAmount = formData.minAmount || undefined;
      } else {
        payload.value = formData.value;
        payload.minQuantity = formData.minQuantity || undefined;
        payload.minAmount = formData.minAmount || undefined;
      }

      if (isEditMode) {
        await promotionsService.update(id!, payload);
        toast.success("Promocion actualizada exitosamente");
      } else {
        await promotionsService.create(payload);
        toast.success("Promocion creada exitosamente");
      }

      navigate("/app/promotions");
    } catch (error) {
      console.error("Error saving promotion:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Error al guardar la promocion");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((itemId) => itemId !== productId)
        : [...prev, productId],
    );
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Editar Promocion" : "Nueva Promocion"}
          </CardTitle>
          <CardDescription>
            Crea promociones automaticas que se aplicaran a productos
            especificos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Black Friday 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripcion de la promocion"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Promocion *</Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona el tipo de promocion que deseas crear
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotionTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: type.value as keyof PromotionType,
                          value: 0,
                          buyQuantity: undefined,
                          getQuantity: undefined,
                        })
                      }
                      className={`
                        relative p-4 rounded-lg border-2 text-left transition-all
                        hover:shadow-md
                        ${
                          isSelected
                            ? `${type.borderColor} ${type.bgColor} shadow-sm`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                          p-2 rounded-lg
                          ${isSelected ? type.color : "text-gray-400"}
                          ${isSelected ? type.bgColor : "bg-gray-100"}
                        `}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold mb-1 ${
                              isSelected ? type.color : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full ${type.color} flex items-center justify-center`}
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {formData.type === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label htmlFor="value">Porcentaje de Descuento (%) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                    placeholder="Ej: 20"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    El producto se vendera con {formData.value}% de descuento
                  </p>
                </div>
              )}

              {formData.type === "FIXED_AMOUNT" && (
                <div className="space-y-2">
                  <Label htmlFor="value">Monto del Descuento ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                    placeholder="Ej: 100"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Se descontaran ${formData.value} del precio del producto
                  </p>
                </div>
              )}

              {formData.type === "BUY_X_GET_Y" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyQuantity">Cantidad a Comprar *</Label>
                    <Input
                      id="buyQuantity"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.buyQuantity || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyQuantity: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Ej: 2"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Compra X unidades
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="getQuantity">Cantidad que Lleva *</Label>
                    <Input
                      id="getQuantity"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.getQuantity || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          getQuantity: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Ej: 1"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Lleva Y unidades gratis
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">
                      Promocion: Compra {formData.buyQuantity || "X"} y lleva{" "}
                      {formData.getQuantity || "Y"}{" "}
                      {formData.getQuantity === 1 ? "gratis" : "adicionales"}
                      {formData.buyQuantity === 2 &&
                        formData.getQuantity === 1 &&
                        " (2x1)"}
                      {formData.buyQuantity === 3 &&
                        formData.getQuantity === 2 &&
                        " (3x2)"}
                    </p>
                  </div>
                </div>
              )}

              {formData.type === "FREE_SHIPPING" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    Los productos seleccionados tendran envio gratis
                    automaticamente.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Fecha de Inicio *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, startsAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Fecha de Fin (opcional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, endsAt: e.target.value })
                  }
                />
              </div>
            </div>

            {(formData.type === "PERCENTAGE" ||
              formData.type === "FIXED_AMOUNT") && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Condiciones (opcional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Cantidad Minima</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="1"
                      value={formData.minQuantity || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minQuantity: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Ej: 2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimo de unidades para aplicar descuento
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Monto Minimo de Compra ($)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minAmount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minAmount: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Ej: 500"
                    />
                    <p className="text-xs text-muted-foreground">
                      El carrito debe superar este monto
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.type === "FREE_SHIPPING" && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Condiciones (opcional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Monto Minimo de Compra ($)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Ej: 1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Envio gratis en compras superiores a este monto
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Promocion activa</Label>
            </div>

            <div className="space-y-2">
              <Label>Productos * (Selecciona al menos uno)</Label>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`product-${product.id}`}
                        className="cursor-pointer flex-1"
                      >
                        {product.name} - ${product.price}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {selectedProducts.length} producto(s) seleccionado(s)
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/promotions")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Actualizar" : "Crear"} Promocion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
