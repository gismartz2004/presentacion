import * as React from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import OptionForm from "./option-form";
import type { FilterOptionFormData, FilterOption, FilterCategory } from "../types";

type OptionModalSimpleProps = {
  typeform: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FilterOptionFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterOptionFormData>>;
  editingOption?: FilterOption | null;
  selectedCategory: FilterCategory | null;
};

export function OptionModalSimple({
  typeform,
  open,
  onOpenChange,
  handleSubmit,
  formData,
  setFormData,
  editingOption,
  selectedCategory,
}: OptionModalSimpleProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = typeform === "add" ? "Nueva Opción" : "Editar Opción";
  const description = typeform === "add" 
    ? "Crea una nueva opción de filtro para una categoría" 
    : "Modifica los datos de la opción de filtro";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <OptionForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingOption={editingOption}
            selectedCategory={selectedCategory}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <OptionForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingOption={editingOption}
            selectedCategory={selectedCategory}
            onCancel={() => onOpenChange(false)}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}