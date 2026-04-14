import { useState, useEffect } from "react";
import { Loader2, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { cmsHomeService } from "../services/cms-home-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image: string | null;
  isLimited?: boolean;
  stock: number;
  category: string;
}

export function HomeLimitedEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("limited");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await cmsHomeService.getLimitedProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLimited = async (productId: string, isLimited: boolean) => {
    try {
      setUpdating(productId);
      await cmsHomeService.toggleLimitedProduct(productId, isLimited);
      
      // Actualizar el estado local
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, isLimited } : p
        )
      );
      
      toast.success(
        isLimited
          ? "Producto marcado como limitado"
          : "Producto desmarcado como limitado"
      );
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error("Error al actualizar el producto");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const limitedProducts = products.filter(p => p.isLimited);
  const regularProducts = products.filter(p => !p.isLimited);

  const filteredLimited = limitedProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRegular = regularProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ediciones Limitadas
            </CardTitle>
            <CardDescription>
              Selecciona los productos para ediciones limitadas. Máximo 5 productos (1 destacado + 4 en lista).
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {limitedProducts.length} limitados
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="limited">
              ✨ Limitados ({filteredLimited.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              📦 Todos ({filteredRegular.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="limited" className="space-y-2">
            {filteredLimited.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? "No se encontraron productos limitados" : "No hay productos marcados como limitados"}
              </p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLimited.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    updating={updating === product.id}
                    onToggle={handleToggleLimited}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-2">
            {filteredRegular.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No se encontraron productos
              </p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredRegular.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    updating={updating === product.id}
                    onToggle={handleToggleLimited}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ProductRowProps {
  product: Product;
  updating: boolean;
  onToggle: (id: string, isLimited: boolean) => void;
}

function ProductRow({ product, updating, onToggle }: ProductRowProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition">
      {/* Imagen */}
      <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{product.name}</h4>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm text-primary font-semibold">
            ${product.price?.toFixed(2) || "0.00"}
          </span>
          <span className="text-xs text-muted-foreground">
            Stock: {product.stock}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {product.category}
          </span>
        </div>
      </div>

      {/* Switch */}
      <div className="flex items-center gap-2">
        {updating ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Switch
            checked={product.isLimited}
            onCheckedChange={(checked) => onToggle(product.id, checked)}
            disabled={updating}
          />
        )}
      </div>
    </div>
  );
}
