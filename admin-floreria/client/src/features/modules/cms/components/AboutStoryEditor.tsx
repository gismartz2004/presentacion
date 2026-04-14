import { useState, useEffect, useCallback } from "react";
import { Loader2, BookOpen, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { cmsAboutService } from "../services/cms-about-service";
import { uploadImage } from "@/core/api/upload";

interface AboutStoryEditorProps {
  lang: string;
}

export default function AboutStoryEditor({ lang }: AboutStoryEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cmsAboutService.getAboutStory(lang);
      const data = response.data.data;
      
      if (data) {
        setFormData({
          title: data.title || "",
          content: data.content || "",
          image: data.image || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos de la historia");
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
      await cmsAboutService.updateAboutStory(lang, formData);
      toast.success("About Story actualizado exitosamente");
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
            <BookOpen className="h-5 w-5" />
            About Story
          </CardTitle>
          <CardDescription>
            Cargando datos de la historia...
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
          <BookOpen className="h-5 w-5" />
          About Story - Sección Historia
        </CardTitle>
        <CardDescription>
          Edita el título, contenido e imagen de la sección de historia. Usa saltos de línea para crear párrafos separados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Our Story"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            placeholder="Escribe la historia aquí. Usa Enter para crear nuevos párrafos."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={8}
          />
          <p className="text-xs text-muted-foreground">
            Cada salto de línea creará un nuevo párrafo en la página.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Imagen</Label>
          <div className="flex gap-2">
            <Input
              id="image"
              placeholder="URL de la imagen o sube una nueva"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {formData.image && (
            <div className="mt-2">
              <img
                src={
                  formData.image.startsWith("http")
                    ? formData.image
                    : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}${formData.image}`
                }
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
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
