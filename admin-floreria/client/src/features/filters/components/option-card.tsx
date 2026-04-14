import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  IconDots, 
  IconEdit, 
  IconTrash,
  IconEyeOff 
} from "@tabler/icons-react";
import type { FilterOption } from "../types";

interface OptionCardProps {
  option: FilterOption;
  onEdit: (option: FilterOption) => void;
  onDelete: (optionId: string) => void;
}

export function OptionCard({ option, onEdit, onDelete }: OptionCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{option.label}</span>
          {!option.isActive && (
            <IconEyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {option.value}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          #{option.sortOrder}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(option)}>
              <IconEdit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(option.id)}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}