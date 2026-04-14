import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { IconDots, IconEdit, IconEyeOff } from "@tabler/icons-react";
import type { FilterCategory } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface CategoryCardProps {
  category: FilterCategory;
  isSelected?: boolean;
  onSelect: (category: FilterCategory) => void;
  onEdit: (category: FilterCategory) => void;
  onDelete: (categoryId: string) => void;
}

const getTypeColor = (type: string) => {
  const colors = {
    SELECT: "bg-blue-100 text-blue-800",
    MULTISELECT: "bg-purple-100 text-purple-800",
    RANGE: "bg-green-100 text-green-800",
    TOGGLE: "bg-yellow-100 text-yellow-800",
    COLOR: "bg-pink-100 text-pink-800",
    SIZE: "bg-orange-100 text-orange-800",
    RATING: "bg-indigo-100 text-indigo-800",
  };
  return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const getTypeLabel = (type: string) => {
  const labels = {
    SELECT: "Selección",
    MULTISELECT: "Múltiple",
    RANGE: "Rango",
    TOGGLE: "Activador",
    COLOR: "Color",
    SIZE: "Talla",
    RATING: "Valoración",
  };
  return labels[type as keyof typeof labels] || type;
};

export function CategoryCard({
  category,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const optionsCount = category.filter_options?.length || 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(category)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {category.label}
              {!category.isActive && (
                <IconEyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              {category.isRequired && (
                <Badge variant="secondary" className="text-xs">
                  Requerido
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {category.name}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(category);
                }}
              >
                <IconEdit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="text-red-600"
                // onClick={(e) => {
                //   e.stopPropagation();
                //   onDelete(category.id);
                // }}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                      {/* <Button variant="outline" color="destructive"> */}
                      <Trash2 className="mr-1 text-red-600 gap-4" />
                      Eliminar
                      {/* </Button> */}
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      {/* <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle> */}
                      <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente tu cuenta y eliminará tus datos de
                        nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDelete(category.id);
                        }}
                      >
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* <IconTrash className="h-4 w-4 mr-2" />
                Eliminar */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getTypeColor(category.type)}>
              {getTypeLabel(category.type)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {optionsCount} opciones
            </span>
          </div>

          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}

          {category.type === "RANGE" && (
            <div className="text-xs text-muted-foreground">
              Rango: {category.minRange || 0} - {category.maxRange || "∞"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
