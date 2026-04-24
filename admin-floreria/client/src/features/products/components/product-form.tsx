import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import ImageUpload from "./image-upload";
import type { FormData, Variant } from "../types";
import { Textarea } from "@/shared/components/ui/textarea";

type ProductFormProps = {
  handleSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  setFormData: React.Dispatch<
    React.SetStateAction<ProductFormProps["formData"]>
  >;
  variants: Array<Variant>;
  setVariants: React.Dispatch<
    React.SetStateAction<ProductFormProps["variants"]>
  >;
  editingProduct: boolean;
  addVariant: () => void;
  moveVariant: (fromIndex: number, toIndex: number) => void;
  updateVariant: (
    index: number,
    field: string,
    value: string | number | boolean
  ) => void;
  removeVariant: (index: number) => void;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProductForm({
  handleSubmit,
  formData,
  setFormData,
  variants,
  setVariants,
  editingProduct,
  addVariant,
  moveVariant,
  updateVariant,
  removeVariant,
  setShowModal,
}: ProductFormProps) {
  const [priceInput, setPriceInput] = useState(
    formData.price > 0 ? String(formData.price) : ""
  );

  useEffect(() => {
    setPriceInput(formData.price > 0 ? String(formData.price) : "");
  }, [formData.price]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Categoría / Etiqueta</label>
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Ej: Rosas, Girasoles, San Valentín..."
          required
        />
      </div>

      {/* Campo de precio - Solo para productos SIN variantes */}
      {!formData.hasVariants && (
        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={priceInput}
            onChange={(e) => {
              const nextValue = e.target.value;
              setPriceInput(nextValue);
              setFormData({
                ...formData,
                price: nextValue === "" ? 0 : parseFloat(nextValue) || 0,
              });
            }}
            required={!formData.hasVariants}
            placeholder="0.00"
          />
        </div>
      )}
      <div>
        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
        <label className="text-sm font-medium">Producto activo</label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.featured}
          onChange={(e) =>
            setFormData({ ...formData, featured: e.target.checked })
          }
        />
        <label className="text-sm font-medium">Producto destacado</label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.hasVariants}
          onChange={(e) => {
            const hasVariants = e.target.checked;
            setFormData({ ...formData, hasVariants });
            if (!hasVariants) {
              setVariants([]);
            }
          }}
        />
        <label className="text-sm font-medium">Producto con variantes</label>
      </div>

      {/* Mensaje informativo */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        {formData.hasVariants ? (
          <p>
            ✨ <strong>Producto con variantes:</strong> Los precios se manejan
            en cada variante individual. Agrega al menos una variante con su
            precio.
          </p>
        ) : (
          <p>
            💰 <strong>Producto simple:</strong> Usa el campo "Precio" arriba
            para establecer un precio fijo para este producto.
          </p>
        )}
      </div>

      {/* Gestión de Variantes */}
      {formData.hasVariants && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Variantes del Producto</h3>
            <Button
              type="button"
              size="sm"
              onClick={addVariant}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>
                No hay variantes. Agrega al menos una variante para productos
                con variantes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          moveVariant(index, Math.max(0, index - 1))
                        }
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          moveVariant(
                            index,
                            Math.min(variants.length - 1, index + 1)
                          )
                        }
                        disabled={index === variants.length - 1}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={variant.isDefault}
                        onChange={(e) =>
                          updateVariant(index, "isDefault", e.target.checked)
                        }
                      />
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Por defecto
                      </label>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeVariant(index)}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nombre
                      </label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(index, "name", e.target.value)
                        }
                        placeholder="Ej: Pequeño, Mediano, Grande"
                        required={formData.hasVariants}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Precio ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        required={formData.hasVariants}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          {editingProduct ? "Actualizar" : "Crear"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowModal(false)}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
