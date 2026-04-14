import { useState, useEffect, useCallback } from "react";
import { Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { cmsHomeService } from "../services/cms-home-service";
import { uploadImage } from "@/core/api/upload";

interface HomeTimelineEditorProps {
  lang: string;
}

export default function HomeTimelineEditor({ lang }: HomeTimelineEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cmsHomeService.getHomeTimeline(lang);
      const data = response.data.data;
      
      if (data) {
        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          buttonText: data.buttonText || "",
          buttonLink: data.buttonLink || "",
          image: data.image || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadImage(file);
      
      if (result.status === "success" && result.url) {
        setFormData({ ...formData, image: result.url });
        toast.success("Imagen subida exitosamente");
      } else {
        toast.error("Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await cmsHomeService.updateHomeTimeline(lang, formData);
      toast.success("Timeline actualizado exitosamente");
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
          <Clock className="h-5 w-5 text-primary" />
          Sección Timeline - Línea de Tiempo
        </CardTitle>
        <CardDescription>
          Edita el contenido de la sección Timeline que muestra el viaje de elegancia celestial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">Título Principal</Label>
          <Input
            id="title"
            placeholder="Viaje de Elegancia Celestial"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Subtítulo */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo (texto en cursiva)</Label>
          <Input
            id="subtitle"
            placeholder="Una Línea de Tiempo de Fragancias"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descubre los capítulos de nuestro legado olfativo..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        {/* Botón - Texto */}
        <div className="space-y-2">
          <Label htmlFor="buttonText">Texto del Botón</Label>
          <Input
            id="buttonText"
            placeholder="Ver Todos los Detalles"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
          />
        </div>

        {/* Botón - Link */}
        <div className="space-y-2">
          <Label htmlFor="buttonLink">Enlace del Botón</Label>
          <Input
            id="buttonLink"
            placeholder="/about"
            value={formData.buttonLink}
            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Usa rutas relativas como /about, /store, etc.
          </p>
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <Label htmlFor="image">Imagen Principal</Label>
          <div className="flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          
          {formData.image && (
            <div className="mt-4 relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
              <img
                src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_URL_IMG}${formData.image}`}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Recomendado: Imagen vertical de alta calidad (mínimo 800x1000px). Máximo 5MB.
          </p>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
