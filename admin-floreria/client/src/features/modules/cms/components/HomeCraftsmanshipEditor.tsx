import { useState, useEffect } from "react";
import { Loader2, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { cmsHomeService } from "../services/cms-home-service";

interface HomeCraftsmanshipEditorProps {
  lang: string;
}

export default function HomeCraftsmanshipEditor({ lang }: HomeCraftsmanshipEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    image: "",
  });

  useEffect(() => {
    loadData();
  }, [lang]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await cmsHomeService.getHomeCraftsmanship(lang);
      const data = response.data.data;
      
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        buttonText: data.buttonText || "",
        buttonLink: data.buttonLink || "",
        image: data.image || "",
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await cmsHomeService.updateHomeCraftsmanship(lang, formData);
      toast.success("Contenido guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el contenido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Sección Craftsmanship - Maestría Artesanal
        </CardTitle>
        <CardDescription>
          Edita el título, subtítulo, botón e imagen central. Las características laterales son estáticas en el código.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">Título Principal</Label>
          <Textarea
            id="title"
            placeholder="Tradición e Innovación se Unen en la Maestría."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            rows={2}
          />
        </div>

        {/* Subtítulo */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo</Label>
          <Input
            id="subtitle"
            placeholder="Revelando el Arte Detrás de Creaciones Atemporales"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Texto del botón */}
          <div className="space-y-2">
            <Label htmlFor="buttonText">Texto del Botón</Label>
            <Input
              id="buttonText"
              placeholder="Ver Detalles Completos"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            />
          </div>

          {/* Link del botón */}
          <div className="space-y-2">
            <Label htmlFor="buttonLink">Enlace del Botón</Label>
            <Input
              id="buttonLink"
              placeholder="/store"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
            />
          </div>
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <Label htmlFor="image">URL de la Imagen Central</Label>
          <Input
            id="image"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          {formData.image && (
            <div className="mt-2 relative w-32 h-40 rounded-lg overflow-hidden border">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/300x400?text=Error";
                }}
              />
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
