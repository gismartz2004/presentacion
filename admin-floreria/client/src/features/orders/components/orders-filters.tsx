import { useCallback, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/shared/components/ui/select";
import { Calendar } from "@/shared/components/ui/calendar";
import { Label } from "@/shared/components/ui/label";
import { Search, Filter, ChevronDownIcon, File } from "lucide-react";
import { LocalDate } from "@/core/utils/date";

interface OrdersFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  rangeDateFilter: string;
  setRangeDateFilter: (v: string) => void;
  statusOptions: { value: string; label: string }[];
  dateFilterStart: LocalDate | undefined;
  setDateFilterStart: (d: LocalDate | undefined) => void;
  dateFilterEnd: LocalDate | undefined;
  setDateFilterEnd: (d: LocalDate | undefined) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (v: boolean) => void;
  minAmount: string;
  maxAmount: string;
  setMinAmount: (v: string) => void;
  setMaxAmount: (v: string) => void;
  onAdvancedApply: () => void;
  onClearAll: () => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (v: boolean) => void;
  hasAdvancedActive: boolean;
}

export function OrdersFilters(props: OrdersFiltersProps) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    statusOptions,
    rangeDateFilter,
    setRangeDateFilter,
    dateFilterStart,
    setDateFilterStart,
    dateFilterEnd,
    setDateFilterEnd,
    showAdvancedFilters,
    setShowAdvancedFilters,
    minAmount,
    maxAmount,
    setMinAmount,
    setMaxAmount,
    onAdvancedApply,
    onClearAll,
    hasAdvancedActive,
  } = props;
  const [datePickerInit, setDatePickerInit] = useState<boolean>(false);
  const [datePickerEnd, setDatePickerEnd] = useState<boolean>(false);

  const toggleAdvanced = useCallback(
    () => setShowAdvancedFilters(!showAdvancedFilters),
    [showAdvancedFilters, setShowAdvancedFilters]
  );

  const onSelectDateStart = (d?: Date) => {
    if (d) {
      setDateFilterStart(new LocalDate(d));
      // Limpiar rango predefinido cuando se selecciona fecha manual
      if (rangeDateFilter) {
        setRangeDateFilter("");
      }
    }
    setDatePickerInit(false);
  };

  const onSelectDateEnd = (d?: Date) => {
    if (d) {
      setDateFilterEnd(new LocalDate(d));
      // Limpiar rango predefinido cuando se selecciona fecha manual
      if (rangeDateFilter) {
        setRangeDateFilter("");
      }
    }
    setDatePickerEnd(false);
  };

  const onSelectRangeDate = (range: string) => {
    setRangeDateFilter(range);
  };

  return (
    <div className="bg-background rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-primary mb-6">
        Filtros y Búsqueda
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/**
           * Search Input
           */}
          <div className="relative col-span-12 md:col-span-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, email o número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {/**
           * Status Select
           */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="col-span-12 md:col-span-3 w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Estados</SelectLabel>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/**
           * Range of dates for selection
           */}
          <Select value={rangeDateFilter} onValueChange={onSelectRangeDate}>
            <SelectTrigger className="col-span-12 md:col-span-3 w-full">
              <SelectValue placeholder="Rango de fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rango de fechas</SelectLabel>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="this_week">Esta semana</SelectItem>
                <SelectItem value="this_month">Este mes</SelectItem>
                <SelectItem value="this_year">Este año</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={toggleAdvanced}
            className={`col-span-1 ${
              hasAdvancedActive
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            {/* Filtros avanzados */}
            {hasAdvancedActive && (
              <span className="bg-blue-500 text-white rounded-full w-2 h-2" />
            )}
          </Button>
        </div>

        {showAdvancedFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="date" className="px-1">
                  Fecha Inicio
                </Label>
                <Popover open={datePickerInit} onOpenChange={setDatePickerInit}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal"
                    >
                      {dateFilterStart
                        ? dateFilterStart.toLocalISODateString().split("T")[0]
                        : "Seleccionar fecha"}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateFilterStart}
                      onSelect={(d?: Date) => onSelectDateStart(d)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="date" className="px-1">
                  Fecha Fin
                </Label>
                <Popover open={datePickerEnd} onOpenChange={setDatePickerEnd}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal"
                    >
                      {dateFilterEnd
                        ? dateFilterEnd.toLocalISODateString().split("T")[0]
                        : "Seleccionar fecha"}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateFilterEnd}
                      onSelect={(d?: Date) => onSelectDateEnd(d)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="block text-gray-700">Monto mínimo</Label>
                <Input
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className=""
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="block text-gray-700">Monto máximo</Label>
                <Input
                  placeholder="1000.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className=""
                />
              </div>
            </div>
            <div className="mt-4 gap-2 grid grid-cols-12">
              <Button
                onClick={onAdvancedApply}
                className="col-span-12 md:col-span-6"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button
                variant="outline"
                onClick={onClearAll}
                className="col-span-12 md:col-span-6"
              >
                <File className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
