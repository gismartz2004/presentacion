import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import dashboard_stats from "../api/dashboard";

// Tipos optimizados
interface ChartData {
  month: string;
  revenue: number;
  orders: number;
  formattedDate?: string;
}

type TimeRange = "7d" | "30d" | "90d";

// Configuración del gráfico como constante
const CHART_CONFIG = {
  orders: {
    label: "Pedidos",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

// Opciones de tiempo como constante
const TIME_RANGE_OPTIONS = [
  { value: "7d" as const, label: "Últimos 7 días", shortLabel: "7d" },
  { value: "30d" as const, label: "Últimos 30 días", shortLabel: "30d" },
  { value: "90d" as const, label: "Últimos 3 meses", shortLabel: "3m" },
] as const;

// Componente de estado de carga
const ChartSkeleton = memo(() => (
  <Card className="@container/card">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="aspect-auto h-[250px] w-full" />
    </CardContent>
  </Card>
));

ChartSkeleton.displayName = "ChartSkeleton";

// Componente de estado de error
const ChartError = memo(({ onRetry }: { onRetry: () => void }) => (
  <Card className="@container/card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        Error al cargar datos
      </CardTitle>
      <CardDescription>
        No se pudieron cargar los datos del gráfico
      </CardDescription>
    </CardHeader>
    <CardContent className="flex justify-center py-8">
      <Button onClick={onRetry} variant="outline">
        Reintentar
      </Button>
    </CardContent>
  </Card>
));

ChartError.displayName = "ChartError";

// Hook personalizado para el manejo de datos del gráfico
const useChartData = (timeRange: TimeRange) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboard_stats.chartData();
      
      if (response.status === "success" && response.data) {
        // Procesar los datos para agregar formato de fecha
        const processedData = response.data.map((item: ChartData) => ({
          ...item,
          formattedDate: new Date(item.month).toLocaleDateString("es-ES", {
            month: "short",
            day: "numeric",
          }),
        }));
        
        setData(processedData);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error fetching chart data:", err);
      setError(errorMessage);
      toast.error("Error al cargar datos del gráfico");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Filtrar datos según el rango de tiempo
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
      default:
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return data.filter((item) => new Date(item.month) >= cutoffDate);
  }, [data, timeRange]);

  return { data: filteredData, isLoading, error, refetch: fetchChartData };
};

// Componente principal optimizado
function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState<TimeRange>("90d");
  const { data, isLoading, error, refetch } = useChartData(timeRange);

  // Ajustar rango por defecto en móvil
  useEffect(() => {
    if (isMobile && timeRange === "90d") {
      setTimeRange("30d");
    }
  }, [isMobile, timeRange]);

  // Calcular métricas resumidas
  const metrics = useMemo(() => {
    if (!data.length) return { totalOrders: 0, totalRevenue: 0, trend: 0 };
    
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    
    // Calcular tendencia (comparación primer vs último período)
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.orders, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.orders, 0) / secondHalf.length;
    
    const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    
    return { totalOrders, totalRevenue, trend };
  }, [data]);

  const currentTimeRangeLabel = TIME_RANGE_OPTIONS.find(
    option => option.value === timeRange
  )?.label || "Período seleccionado";

  // Estados de carga y error
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartError onRetry={refetch} />;
  }

  if (!data.length) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Análisis de Ventas</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="text-center space-y-2">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No se encontraron datos para el período seleccionado
            </p>
            <Button onClick={refetch} variant="outline" size="sm">
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análisis de Ventas
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>{currentTimeRangeLabel}</span>
              <span className="text-xs">
                {metrics.totalOrders} pedidos • ${metrics.totalRevenue.toLocaleString()}
              </span>
              {metrics.trend !== 0 && (
                <span className={`text-xs flex items-center gap-1 ${
                  metrics.trend > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {metrics.trend > 0 ? "↗" : "↘"} {Math.abs(metrics.trend).toFixed(1)}%
                </span>
              )}
            </CardDescription>
          </div>
          
          <CardAction>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger 
                className="w-32 md:w-40" 
                size="sm"
                aria-label="Seleccionar período de tiempo"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="rounded-lg"
                  >
                    <span className="hidden md:inline">{option.label}</span>
                    <span className="md:hidden">{option.shortLabel}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={CHART_CONFIG}
          className="aspect-auto h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString("es-ES", {
                    month: "short",
                    day: isMobile ? undefined : "numeric",
                  });
                }}
                className="text-xs"
              />
              
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : Math.floor(data.length / 2)}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                    formatter={(value, name) => [
                      name === "orders" ? `${value} pedidos` : `$${Number(value).toLocaleString()}`,
                      name === "orders" ? "Pedidos" : "Ingresos"
                    ]}
                    indicator="dot"
                  />
                }
              />
              
              <Area
                dataKey="orders"
                type="natural"
                fill="url(#fillOrders)"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                stackId="a"
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default memo(ChartAreaInteractive);

// Mantener export nombrado para compatibilidad
export { ChartAreaInteractive };
