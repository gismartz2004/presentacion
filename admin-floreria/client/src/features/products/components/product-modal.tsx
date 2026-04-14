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
import ProductForm from "./product-form";
import type { FormData, Product, Variant } from "../types";
import { IconCirclePlusFilled } from "@tabler/icons-react";

type ProductModalProps = {
  typeform: "add" | "edit";
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleShow: (product?: Product) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formData: FormData;
  setFormData: React.Dispatch<
    React.SetStateAction<ProductModalProps["formData"]>
  >;
  variants: Array<Variant>;
  setVariants: React.Dispatch<
    React.SetStateAction<ProductModalProps["variants"]>
  >;
  editingProduct?: { id: string } | null;
  addVariant: () => void;
  moveVariant: (fromIndex: number, toIndex: number) => void;
  updateVariant: (
    index: number,
    field: string,
    value: string | number | boolean
  ) => void;
  removeVariant: (index: number) => void;
};

export function ProductModal({
  typeform,
  open: externalOpen,
  setOpen: setExternalOpen,
  handleShow,
  handleSubmit,
  formData,
  setFormData,
  variants,
  setVariants,
  addVariant,
  moveVariant,
  updateVariant,
  removeVariant,
}: ProductModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Usar el estado externo si está disponible, sino usar el interno
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => handleShow()}>
            <IconCirclePlusFilled />
            {typeform === "add" ? "Agregar Producto" : "Editar Producto"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Formulario</DialogTitle>
            <DialogDescription>
              Realiza cambios en la información del producto aquí. Haz clic en
              guardar cuando hayas terminado.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            variants={variants}
            editingProduct={typeform === "edit"}
            handleSubmit={handleSubmit}
            setFormData={setFormData}
            setVariants={setVariants}
            addVariant={addVariant}
            moveVariant={moveVariant}
            updateVariant={updateVariant}
            removeVariant={removeVariant}
            setShowModal={setOpen}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button onClick={() => handleShow()}>
          <IconCirclePlusFilled />
          {typeform === "add" ? "Agregar Producto" : "Editar Producto"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Formulario de producto</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <ProductForm
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          variants={variants}
          setVariants={setVariants}
          editingProduct={typeform === "edit"}
          addVariant={addVariant}
          moveVariant={moveVariant}
          updateVariant={updateVariant}
          removeVariant={removeVariant}
          setShowModal={setOpen}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
