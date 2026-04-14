import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { FilterOptionFormData, FilterOption, FilterCategory } from "../types";

interface OptionFormProps {
  formData: FilterOptionFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterOptionFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  selectedCategory: FilterCategory | null;
  editingOption?: FilterOption | null;
  onCancel: () => void;
}

export default function OptionForm({
  formData,
  setFormData,
  handleSubmit,
  selectedCategory,
  editingOption,
  onCancel,
}: OptionFormProps) {
  const updateFormData = (field: keyof FilterOptionFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!selectedCategory) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Selecciona una categoría para agregar opciones
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">Categoría seleccionada:</p>
        <p className="text-lg font-semibold text-primary">{selectedCategory.label}</p>
        <p className="text-xs text-muted-foreground">Tipo: {selectedCategory.type}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Valor *</Label>
          <Input
            id="value"
            placeholder="e.g. chanel, xl, red"
            value={formData.value}
            onChange={(e) => updateFormData("value", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Valor interno (sin espacios, minúsculas)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Etiqueta *</Label>
          <Input
            id="label"
            placeholder="e.g. Chanel, XL, Rojo"
            value={formData.label}
            onChange={(e) => updateFormData("label", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Texto visible para el usuario
          </p>
        </div>
      </div>

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
          Orden en el que aparecerá en la lista
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => updateFormData("isActive", !!checked)}
        />
        <Label htmlFor="isActive">Activo</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingOption ? "Actualizar" : "Crear"} Opción
        </Button>
      </div>
    </form>
  );
}