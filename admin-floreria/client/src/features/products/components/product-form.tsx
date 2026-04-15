import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import ImageUpload from "./image-upload";
import type { FormData, Variant } from "../types";
import { Textarea } from "@/shared/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import filtersService from "@/features/filters/api/filters-service";
import type { FilterCategory, FilterOption } from "@/features/filters/types";

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
  // Paso 1: seleccionar categoría de filtro, Paso 2: seleccionar opción
  type TCategory = Pick<FilterCategory, "id" | "name" | "label">;
  type TOption = Pick<FilterOption, "id" | "value" | "label">;
  const [filterCategories, setFilterCategories] = useState<TCategory[]>([]);
  const [filterOptions, setFilterOptions] = useState<TOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  // Cargar categorías de filtros disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await filtersService.getCategories();
        if (res.status === "success" && res.data) {
          const cats = res.data.map((c: FilterCategory) => ({
            id: c.id,
            name: c.name,
            label: c.label,
          }));
          setFilterCategories(cats);

          // Si existe una que se llame "category" o cuyo label contenga "categor",
          // la preseleccionamos para guiar al usuario
          const preferred = res.data.find(
            (c: FilterCategory) =>
              c.name?.toLowerCase() === "category" ||
              c.label?.toLowerCase().includes("categor")
          );
          if (preferred && !formData.selectedFilterCategoryId) {
            setFormData(prev => ({ ...prev, selectedFilterCategoryId: preferred.id }));
          }
        }
      } catch {
        setFilterCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Sincronizar selectedFilterCategoryId con la categoría actual si estamos editando
  useEffect(() => {
    if (editingProduct && filterCategories.length > 0 && formData.category && !formData.selectedFilterCategoryId) {
      const match = filterCategories.find(
        c => c.label === formData.category || c.name === formData.category
      );
      if (match) {
        setFormData(prev => ({ ...prev, selectedFilterCategoryId: match.id }));
      }
    }
  }, [filterCategories, editingProduct, formData.category]);

  // Cargar opciones cuando cambia la categoría seleccionada
  useEffect(() => {
    const loadOptions = async () => {
      if (!formData.selectedFilterCategoryId) {
        setFilterOptions([]);
        return;
      }
      try {
        setLoadingOptions(true);
        const res = await filtersService.getOptionsByCategory(
          formData.selectedFilterCategoryId
        );
        if (res.status === "success" && res.data) {
          const opts = res.data.map((o: FilterOption) => ({
            id: o.id,
            value: o.id,
            label: o.label,
          }));
          setFilterOptions(opts);
        } else {
          setFilterOptions([]);
        }
      } catch {
        setFilterOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, [formData.selectedFilterCategoryId]);

  // useEffect(() => {
  //   setSelectedFilterCategoryId(formData.category);
  // }, []);

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
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
        {filterCategories.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Paso 1: seleccionar categoría de filtro */}
              <div>
                <Select
                  value={formData.selectedFilterCategoryId || ""}
                  onValueChange={(val) => {
                    const cat = filterCategories.find(c => c.id === val);
                    // Al cambiar categoría, guardamos el nombre real para la web
                    setFormData({
                      ...formData,
                      category: cat?.label || cat?.name || val,
                      selectedFilterCategoryId: val,
                      selectedFilterOptionId: undefined,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "Cargando categorías..."
                          : "Selecciona una categoría de filtros"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filterCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Paso 2: seleccionar opción de esa categoría */}
              <div>
                <Select
                  value={formData.selectedFilterOptionId}
                  onValueChange={(val) => {
                    setFormData({
                      ...formData,
                      selectedFilterOptionId: val,
                    });
                  }}
                  disabled={!formData.selectedFilterCategoryId || loadingOptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !formData.selectedFilterCategoryId
                          ? "Selecciona primero una categoría"
                          : loadingOptions
                          ? "Cargando opciones..."
                          : "Selecciona una opción"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">O escribe una categoría personalizada:</p>
              <Input 
                placeholder="Ej: Rosas, Ofertas, San Valentín..."
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </>
        )}
      </div>

      {/* Filtros del producto (múltiples) */}
      {filterCategories.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filtros adicionales</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                // Agregar fila vacía
                const next = [
                  ...(formData.productFilters || []),
                  { categoryId: "", optionId: "" },
                ];
                setFormData({ ...formData, productFilters: next });
              }}
            >
              + Añadir filtro
            </Button>
          </div>

          {(formData.productFilters || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay filtros añadidos.
            </p>
          ) : (
            <div className="space-y-2">
              {(formData.productFilters || []).map((pf, idx) => {
                // Opciones por fila
                const isSelected = pf.categoryId;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                  >
                    <div className="md:col-span-2">
                      <Select
                        value={pf.categoryId}
                        onValueChange={async (val) => {
                          const next = [...(formData.productFilters || [])];
                          next[idx] = { categoryId: val, optionId: "" };
                          setFormData({ ...formData, productFilters: next, selectedFilterCategoryId: val });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.label || c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Select
                        value={pf.optionId}
                        onValueChange={(val) => {
                          const next = [...(formData.productFilters || [])];
                          next[idx] = { ...next[idx], optionId: val };
                          setFormData({ ...formData, productFilters: next });
                        }}
                        disabled={!isSelected}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isSelected ? "Opción" : "Elige categoría"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Para garantizar coherencia, si la categoría de la fila no coincide con selectedFilterCategoryId,
                              recargaremos options al seleccionar categoría (arriba) */}
                          {pf.categoryId === formData.selectedFilterCategoryId
                            ? filterOptions.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.label}
                                </SelectItem>
                              ))
                            : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const next = (formData.productFilters || []).filter(
                            (_, i) => i !== idx
                          );
                          setFormData({ ...formData, productFilters: next });
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Campo de precio - Solo para productos SIN variantes */}
      {!formData.hasVariants && (
        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
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
            // Si se desmarca, limpiar variantes
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
                        placeholder="Ej: Carne, Pollo, Pescado"
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
