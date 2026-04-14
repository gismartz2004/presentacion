import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Save, Loader2, Upload, X, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  cmsHomeService,
  type HomeHeroData,
} from "../services/cms-home-service";
import { uploadImage } from "@/core/api/upload";
import { getImageUrl } from "@/core/utils/variables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface HomeHeroEditorProps {
  lang: string;
}

type Image = {
  url: string;
  alt: string;
};

type ExtendedHomeHeroData = HomeHeroData & {
  backgroundType?: "video" | "carousel";
  videoUrl?: string;
  images?: Image[];
};

export default function HomeHeroEditor({ lang }: HomeHeroEditorProps) {
  const [form, setForm] = useState<ExtendedHomeHeroData>({
    lang,
    title: "",
    description: "",
    nameLink: "Ver Todos los Productos",
    link_women: "/store",
    link_men: "/store",
    backgroundType: "video",
    videoUrl: "/video-home-hero.webm",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await cmsHomeService.getHomeHero(lang);
      if (response.data.data) {
        const data = response.data.data;
        
        // Parsear images si viene como string JSON
        let parsedImages = [];
        if (data.images) {
          if (typeof data.images === 'string') {
            try {
              parsedImages = JSON.parse(data.images);
            } catch (e) {
              console.error("Error parsing images:", e);
              parsedImages = [];
            }
          } else if (Array.isArray(data.images)) {
            parsedImages = data.images;
          }
        }
        
        setForm({ 
          ...form, 
          ...data,
          backgroundType: data.backgroundType || "video",
          videoUrl: data.videoUrl || "/video-home-hero.webm",
          images: parsedImages,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (máximo 5MB)");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadImage(file);
      
      if (response.status === "success") {
        const currentImages = Array.isArray(form.images) ? form.images : [];
        const newImages = [...currentImages, { url: response.url, alt: `Imagen ${currentImages.length + 1}` }];
        setForm({ ...form, images: newImages });
        toast.success("Imagen cargada exitosamente");
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        console.error("Upload failed:", response);
        toast.error(response.message || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al cargar la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Solo se permiten archivos de video");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (máximo 50MB)");
      return;
    }

    setUploadingVideo(true);
    try {
      const response = await uploadImage(file);
      
      if (response.status === "success") {
        setForm({ ...form, videoUrl: response.url });
        toast.success("Video subido exitosamente");
        
        if (videoInputRef.current) {
          videoInputRef.current.value = "";
        }
      } else {
        console.error("Upload failed:", response);
        toast.error(response.message || "Error al subir el video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Error al cargar el video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = Array.isArray(form.images) ? form.images : [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages });
    toast.success("Imagen eliminada");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await cmsHomeService.updateHomeHero(lang, form);
      toast.success("Hero actualizado exitosamente");
      await loadData(); // Recargar datos actualizados
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hero Section</h3>
          <p className="text-sm text-muted-foreground">
            Banner principal de la página de inicio
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Título Principal</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Esculpiendo Sueños en una Botella"
          />
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción del hero..."
            rows={4}
          />
        </div>

        <div>
          <Label>Texto del Botón</Label>
          <Input
            value={form.nameLink || ""}
            onChange={(e) => setForm({ ...form, nameLink: e.target.value })}
            placeholder="Ver Todos los Productos"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Link Mujeres</Label>
            <Input
              value={form.link_women || ""}
              onChange={(e) => setForm({ ...form, link_women: e.target.value })}
              placeholder="/store"
            />
          </div>

          <div>
            <Label>Link Hombres</Label>
            <Input
              value={form.link_men || ""}
              onChange={(e) => setForm({ ...form, link_men: e.target.value })}
              placeholder="/store"
            />
          </div>
        </div>

        {/* Tipo de fondo */}
        <div className="border-t pt-4 mt-4">
          <Label htmlFor="backgroundType" className="text-base font-semibold mb-3 block">
            Tipo de fondo del Hero
          </Label>
          <Select
            value={form.backgroundType}
            onValueChange={(value) => setForm({ ...form, backgroundType: value as "video" | "carousel" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el tipo de fondo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Video de fondo</div>
                    <div className="text-xs text-muted-foreground">Muestra un video en bucle</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="carousel">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Carrusel de imágenes</div>
                    <div className="text-xs text-muted-foreground">Muestra imágenes rotativas</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* URL del video - solo si backgroundType es video */}
        {form.backgroundType === "video" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="videoUrl" className="text-base font-semibold">Video de fondo</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
                className="flex items-center gap-2"
              >
                {uploadingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Cargar Video
                  </>
                )}
              </Button>
            </div>

            {/* Input de video oculto */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />

            <div>
              <Label htmlFor="videoUrl">URL del video</Label>
              <Input
                id="videoUrl"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="/video-home-hero.webm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Puedes ingresar la URL manualmente o usar el botón "Cargar Video" para subirlo a Cloudinary
              </p>
            </div>

            {/* Vista previa del video */}
            {form.videoUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
                <video
                  src={form.videoUrl}
                  className="w-full max-h-64 rounded-lg"
                  controls
                  muted
                />
              </div>
            )}
          </div>
        )}

        {/* Imágenes del carrusel - solo si backgroundType es carousel */}
        {form.backgroundType === "carousel" && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-semibold">Imágenes del carrusel</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Cargar Imagen
                  </>
                )}
              </Button>
            </div>

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {(!Array.isArray(form.images) || form.images.length === 0) && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay imágenes en el carrusel</p>
                <p className="text-sm">Haz clic en "Cargar Imagen" para agregar</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {Array.isArray(form?.images) && form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={getImageUrl(img.url)}
                    alt={img.alt || `Imagen ${i + 1}`}
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
