import { useState, useEffect, useCallback } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { cmsContactService } from "../services/cms-contact-service";

interface ContactMapEditorProps {
  lang: string;
}

export default function ContactMapEditor({ lang }: ContactMapEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mapUrl: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cmsContactService.getContactMap(lang);
      const data = response.data.data;
      
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          mapUrl: data.mapUrl || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos del mapa");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await cmsContactService.updateContactMap(lang, formData);
      toast.success("Mapa actualizado exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Ubicación
          </CardTitle>
          <CardDescription>
            Cargando datos del mapa...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Ubicación - Cómo Llegar
        </CardTitle>
        <CardDescription>
          Edita la sección del mapa y las instrucciones de ubicación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="How to Arrive"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Find us at our location..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapUrl">URL del Mapa (Iframe Embed)</Label>
          <Textarea
            id="mapUrl"
            placeholder="https://www.google.com/maps/embed?pb=..."
            value={formData.mapUrl}
            onChange={(e) =>
              setFormData({ ...formData, mapUrl: e.target.value })
            }
            rows={4}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Obtén el código de inserción desde Google Maps: Compartir {">"} Insertar un mapa {">"} Copiar HTML
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
