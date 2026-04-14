import { useEffect, useRef, useState } from "react";
import service from "@/core/api/service";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Save, Upload, X, Video, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "sonner";
import { uploadImage } from "@/core/api/upload";
import { Spinner } from "@/shared/components/ui/spinner";
import { getImageUrl } from "@/core/utils/variables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Image = {
  url: string;
  alt: string;
};

type CmsHomeForm = {
  id: number;
  title: string;
  description: string;
  nameLink: string;
  link_women: string;
  link_men: string;
  images: Image[];
  backgroundType: "video" | "carousel";
  videoUrl: string;
};

export default function CmsHomeEditor() {
  const [form, setForm] = useState<CmsHomeForm>({
    id: 0,
    title: "",
    description: "",
    nameLink: "",
    link_women: "",
    link_men: "",
    images: [],
    backgroundType: "video",
    videoUrl: "/video-home-hero.webm",
  });
  const [lang, setLang] = useState<string>("es");
  const LANGS = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ];
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    service
      .get(`/cms/home?lang=${lang}`)
      .then((res) => {
        console.log("Fetched form data:", res.data);
        if (res.data) setForm({
          ...res.data,
          backgroundType: res.data.backgroundType || "video",
          videoUrl: res.data.videoUrl || "/video-home-hero.webm",
          images: res.data.images || [],
        });
        else
          setForm({
            id: 0,
            title: "",
            description: "",
            nameLink: "",
            link_women: "",
            link_men: "",
            images: [],
            backgroundType: "video",
            videoUrl: "/video-home-hero.webm",
          });
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones del lado del cliente
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (máximo 5MB)");
      return;
    }

    try {
      const response = await uploadImage(file);

      if (response.status === "success") {
        const images = form.images ? [...form.images] : [];
        images.push({ url: response.url, alt: "" });
        setForm({ ...form, images });
        toast.success("Imagen subida exitosamente");
      } else {
        console.error("Upload failed:", response);
        toast.error(
          response.message || response.error || "Error al subir la imagen"
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = ({ id }: { id: number }) => {
    const updatedImages = form.images.filter((_, index) => index !== id);
    setForm({ ...form, images: updatedImages });
    toast.success("Imagen removida");
  };

  const handleSave = async () => {
    setLoading(true);
    console.log("Saving form data:", { ...form, lang });
    try {
      console.log(form);
      if (form.id === 0) {
        await service.post("/cms/home", { ...form, lang });
      } else {
        await service.put(`/cms/home/${form.id}`, { ...form, lang });
      }
      toast.success("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error saving form data:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gap-4 md:gap-6 py-4 md:py-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">Editor de página Home</h1>
      {/**
       * -----------------------
       * |          |           |
       * |   Form   |     Img   |
       * |          |           |
       * |          |           |
       * -----------------------
       */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Opciones de sección Home</h2>
          <Tabs value={lang} onValueChange={setLang} className="mb-6">
            <TabsList className="flex gap-2">
              {LANGS.map((l) => (
                <TabsTrigger
                  key={l.value}
                  value={l.value}
                  className="px-4 py-2"
                >
                  {l.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Descripción"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="nameLink">Texto del botón</Label>
              <Input
                id="nameLink"
                value={form.nameLink}
                onChange={(e) => setForm({ ...form, nameLink: e.target.value })}
                placeholder="Texto del botón"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="link_women">Link para mujer</Label>
              <Input
                id="link_women"
                value={form.link_women}
                onChange={(e) =>
                  setForm({ ...form, link_women: e.target.value })
                }
                placeholder="https://..."
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="link_men">Link para hombre</Label>
              <Input
                id="link_men"
                value={form.link_men}
                onChange={(e) => setForm({ ...form, link_men: e.target.value })}
                placeholder="https://..."
                disabled={loading}
              />
            </div>

            {/* Tipo de fondo */}
            <div className="border-t pt-4 mt-4">
              <Label htmlFor="backgroundType" className="text-base font-semibold mb-3 block">
                Tipo de fondo del Hero
              </Label>
              <Select
                value={form.backgroundType}
                onValueChange={(value) => setForm({ ...form, backgroundType: value as "video" | "carousel" })}
                disabled={loading}
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
              <div>
                <Label htmlFor="videoUrl">URL del video</Label>
                <Input
                  id="videoUrl"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="/video-home-hero.webm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ruta del archivo de video (ej: /video-home-hero.webm)
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="text-xl font-bold mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">
                {form.backgroundType === "carousel" ? "Imágenes del carrusel" : "Vista previa"}
              </h2>
              {form.backgroundType === "carousel" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Spinner />}
                  {!loading && <Upload size={16} />}
                  {loading ? "Subiendo..." : "Cargar Imagen"}
                </Button>
              )}
            </div>

            {form.backgroundType === "video" ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-muted-foreground mb-2">
                  El video se mostrará como fondo del hero
                </p>
                <div className="text-sm font-mono bg-white p-2 rounded border">
                  {form.videoUrl}
                </div>
              </div>
            ) : (
              <>
                {/* Input de archivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {(!form.images || form.images.length === 0) && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay imágenes en el carrusel</p>
                    <p className="text-sm">Haz clic en "Cargar Imagen" para agregar</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {form?.images?.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={getImageUrl(img.url)}
                        alt={`Imagen ${i + 1}`}
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage({ id: i })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Imagen {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Button className="w-full mt-6" onClick={handleSave} disabled={loading}>
        <Save className="mr-2" />
        Guardar
      </Button>
    </div>
  );
}
