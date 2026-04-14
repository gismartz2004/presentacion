import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorState({ 
  error, 
  onRetry, 
  title = "Error al cargar datos" 
}: ErrorStateProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600">
          {error}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="text-center">
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      )}
    </Card>
  );
}