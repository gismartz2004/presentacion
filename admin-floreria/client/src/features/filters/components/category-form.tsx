import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { FilterCategoryFormData, FilterCategory, FilterType } from "../types";

interface CategoryFormProps {
  formData: FilterCategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterCategoryFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  editingCategory?: FilterCategory | null;
  onCancel: () => void;
}

const filterTypeOptions: { value: FilterType; label: string }[] = [
  { value: "SELECT", label: "Selección Única" },
  { value: "MULTISELECT", label: "Selección Múltiple" },
  { value: "RANGE", label: "Rango de Valores" },
  { value: "TOGGLE", label: "Activador (Sí/No)" },
  { value: "COLOR", label: "Selector de Color" },
  { value: "SIZE", label: "Selector de Talla" },
  { value: "RATING", label: "Valoración por Estrellas" },
];

export default function CategoryForm({
  formData,
  setFormData,
  handleSubmit,
  editingCategory,
  onCancel,
}: CategoryFormProps) {
  const updateFormData = (field: keyof FilterCategoryFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showRangeFields = formData.type === "RANGE";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            placeholder="e.g. brand, size, color"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Identificador único (sin espacios, en inglés)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Etiqueta *</Label>
          <Input
            id="label"
            placeholder="e.g. Marca, Talla, Color"
            value={formData.label}
            onChange={(e) => updateFormData("label", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Nombre visible para el usuario
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Descripción de la categoría de filtro"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Filtro *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: FilterType) => updateFormData("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {filterTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            placeholder="Texto de ayuda"
            value={formData.placeholder}
            onChange={(e) => updateFormData("placeholder", e.target.value)}
          />
        </div>
      </div>

      {showRangeFields && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minRange">Valor Mínimo</Label>
            <Input
              id="minRange"
              type="number"
              placeholder="0"
              value={formData.minRange || ""}
              onChange={(e) => updateFormData("minRange", e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRange">Valor Máximo</Label>
            <Input
              id="maxRange"
              type="number"
              placeholder="1000"
              value={formData.maxRange || ""}
              onChange={(e) => updateFormData("maxRange", e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Orden de Clasificación</Label>
        <Input
          id="sortOrder"
          type="number"
          placeholder="0"
          value={formData.sortOrder}
          onChange={(e) => updateFormData("sortOrder", parseInt(e.target.value) || 0)}
        />
        <p className="text-xs text-muted-foreground">
          Orden en el que aparecerá en la lista (menor número = primera posición)
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRequired"
            checked={formData.isRequired}
            onCheckedChange={(checked) => updateFormData("isRequired", !!checked)}
          />
          <Label htmlFor="isRequired">Campo requerido</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => updateFormData("isActive", !!checked)}
          />
          <Label htmlFor="isActive">Activo</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingCategory ? "Actualizar" : "Crear"} Categoría
        </Button>
      </div>
    </form>
  );
}