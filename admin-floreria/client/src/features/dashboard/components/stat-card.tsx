import { memo } from "react";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: "increase" | "decrease";
  };
  description?: string;
  icon?: React.ReactNode;
  format?: "currency" | "number";
}

function StatCard({ 
  title, 
  value, 
  change, 
  description, 
  icon, 
  format = "number" 
}: StatCardProps) {
  const formattedValue = format === "currency" 
    ? typeof value === 'number' ? `$${value.toLocaleString()}` : value
    : typeof value === 'number' ? value.toLocaleString() : value;

  const changeText = change ? (
    change.direction === "increase" 
      ? "Crecimiento este mes" 
      : "Disminución este mes"
  ) : null;

  const TrendIcon = change?.direction === "increase" ? IconTrendingUp : IconTrendingDown;

  return (
    <Card className="@container/card transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formattedValue}
        </CardTitle>
        {change && (
          <CardAction>
            <Badge variant="outline" className={
              change.direction === "increase" 
                ? "border-green-200 bg-green-50 text-green-700" 
                : "border-red-200 bg-red-50 text-red-700"
            }>
              <TrendIcon className="w-3 h-3 mr-1" />
              {change.value}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(changeText || description) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {changeText && (
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {changeText}
              <TrendIcon className="size-4" />
            </div>
          )}
          {description && (
            <div className="text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Memoizar el componente para evitar re-renderizados innecesarios
export default memo(StatCard);