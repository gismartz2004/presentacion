import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { promotionsService, type Promotion } from "../services/promotions-services";

const typeLabels: Record<string, string> = {
  PERCENTAGE: "Porcentaje",
  FIXED_AMOUNT: "Monto Fijo",
  BUY_X_GET_Y: "2x1 / 3x2",
  FREE_SHIPPING: "Envío Gratis",
};

export default function PromotionsList() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionsService.findAll();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar esta promoción?")) return;

    try {
      setDeleting(id);
      await promotionsService.remove(id);
      toast.success("Promoción desactivada");
      fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Error al desactivar promoción");
    } finally {
      setDeleting(null);
    }
  };

  const isActive = (promotion: Promotion) => {
    if (!promotion.isActive) return false;

    const now = new Date();
    const startsAt = new Date(promotion.startsAt);
    const endsAt = promotion.endsAt ? new Date(promotion.endsAt) : null;

    return startsAt <= now && (!endsAt || endsAt >= now);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.type === "PERCENTAGE") return `${promotion.value}%`;
    if (promotion.type === "FIXED_AMOUNT") return `$${promotion.value}`;
    if (promotion.type === "BUY_X_GET_Y") {
      const buyQuantity = promotion.buyQuantity ?? promotion.value;
      const getQuantity = promotion.getQuantity ?? promotion.minQuantity;
      return getQuantity
        ? `Compra ${buyQuantity}, lleva ${getQuantity}`
        : `Compra ${buyQuantity}`;
    }
    if (promotion.type === "FREE_SHIPPING") return "Envio gratis";
    return String(promotion.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promociones</CardTitle>
              <CardDescription>
                Gestiona las promociones automáticas de productos
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/app/promotions/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Promoción
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No hay promociones creadas
              </p>
              <Button onClick={() => navigate("/app/promotions/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Promoción
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">
                      {promotion.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeLabels[promotion.type] || promotion.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatPromotionValue(promotion)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(promotion.startsAt)}
                        {promotion.endsAt &&
                          ` - ${formatDate(promotion.endsAt)}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promotion.products.length} producto(s)
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isActive(promotion) ? "default" : "secondary"}
                      >
                        {isActive(promotion) ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/app/promotions/${promotion.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promotion.id)}
                          disabled={deleting === promotion.id}
                        >
                          {deleting === promotion.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
