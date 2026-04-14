import { Button } from "@/shared/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/shared/components/ui/select";

interface OrdersBulkActionsProps {
  count: number;
  onClear: () => void;
  statusOptions: { value: string; label: string }[];
  onUpdateMany: (status: string) => void;
  onExport?: () => void;
}

export function OrdersBulkActions({ count, onClear, statusOptions, onUpdateMany, onExport }: OrdersBulkActionsProps) {
  if (count === 0) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
      <h2 className="text-lg font-semibold text-blue-900 mb-4">Acciones en Lote</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{count} órden(es)</div>
          <Button variant="outline" size="sm" onClick={onClear} className="text-blue-700 border-blue-300 hover:bg-blue-50">Limpiar selección</Button>
        </div>
        <div className="flex items-center gap-3">
          <Select onValueChange={onUpdateMany}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cambiar a:</SelectLabel>
                {statusOptions.filter(o => o.value !== 'ALL').map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="bg-white" onClick={onExport}>Exportar</Button>
        </div>
      </div>
    </div>
  );
}
