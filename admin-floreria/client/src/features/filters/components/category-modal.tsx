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
import CategoryForm from "./category-form";
import type { FilterCategoryFormData, FilterCategory } from "../types";

type CategoryModalProps = {
  typeform: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FilterCategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<FilterCategoryFormData>>;
  editingCategory?: FilterCategory | null;
};

export function CategoryModal({
  typeform,
  open,
  onOpenChange,
  handleSubmit,
  formData,
  setFormData,
  editingCategory,
}: CategoryModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = typeform === "add" ? "Nueva Categoría" : "Editar Categoría";
  const description = typeform === "add" 
    ? "Crea una nueva categoría de filtros para tus productos" 
    : "Modifica los datos de la categoría";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {typeform === "add" && (
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <IconCirclePlusFilled className="h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingCategory={editingCategory}
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
          <Button className="flex items-center gap-2">
            <IconCirclePlusFilled className="h-4 w-4" />
            Nueva Categoría
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingCategory={editingCategory}
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