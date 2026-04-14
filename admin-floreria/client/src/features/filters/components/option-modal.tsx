import * as React from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { IconCirclePlusFilled } from "@tabler/icons-react";
import OptionForm from "./option-form";
import type { FilterOptionFormData, FilterOption, FilterCategory } from "../types";

type OptionModalProps = {
  typeform: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FilterOptionFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterOptionFormData>>;
  selectedCategory: FilterCategory | null;
  editingOption?: FilterOption | null;
};

export function OptionModal({
  typeform,
  open,
  onOpenChange,
  handleSubmit,
  formData,
  setFormData,
  selectedCategory,
  editingOption,
}: OptionModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = typeform === "add" ? "Nueva Opción" : "Editar Opción";
  const description = typeform === "add" 
    ? `Agrega una nueva opción a la categoría "${selectedCategory?.label}"` 
    : "Modifica los datos de la opción";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {typeform === "add" && (
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              disabled={!selectedCategory}
            >
              <IconCirclePlusFilled className="h-4 w-4" />
              Nueva Opción
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <OptionForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            selectedCategory={selectedCategory}
            editingOption={editingOption}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {typeform === "add" && (
        <DrawerTrigger asChild>
          <Button 
            className="flex items-center gap-2"
            disabled={!selectedCategory}
          >
            <IconCirclePlusFilled className="h-4 w-4" />
            Nueva Opción
          </Button>
        </DrawerTrigger>
      )}
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
            selectedCategory={selectedCategory}
            editingOption={editingOption}
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