import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/core/utils/variables";
import productsService from "../api/products-service";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState(value || "");
  const [previewError, setPreviewError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const looksLikeDirectImageUrl = (url: string) => {
    if (url.startsWith("/")) return true;
    if (url.startsWith("data:image/")) return true;
    return /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url);
  };

  useEffect(() => {
    setUrlInput(value || "");
    setPreviewError(false);
  }, [value]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (maximo 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      const response = await productsService.uploadImage(file);
      if (response.status === "success" && response.url) {
        onChange(response.url);
        setUrlInput(response.url);
        setPreviewError(false);
        toast.success("Imagen subida exitosamente");
      } else {
        toast.error(response.message || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Error al subir la imagen";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    const nextUrl = urlInput.trim();

    if (!nextUrl) {
      toast.error("Ingresa una URL de imagen");
      return;
    }

    onChange(nextUrl);
    setPreviewError(false);

    if (!looksLikeDirectImageUrl(nextUrl)) {
      toast.warning(
        "La URL parece ser una pagina y no una imagen directa. Usa un enlace que termine en .jpg, .png, .webp o similar."
      );
      return;
    }

    toast.success("URL de imagen agregada");
  };

  const removeImage = () => {
    onChange("");
    setUrlInput("");
    setPreviewError(false);
    toast.success("Imagen removida");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        Imagen del Producto
      </label>

      {value && (
        <div className="relative inline-block">
          {!previewError ? (
            <img
              src={getImageUrl(value)}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs text-red-600">
              La imagen no se pudo cargar
            </div>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {!disabled && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
              ) : (
                <Upload size={16} />
              )}
              {isUploading ? "Subiendo..." : "Subir archivo"}
            </Button>

            <div className="flex-1">
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>

            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="flex items-center gap-2"
            >
              <ImageIcon size={16} />
              Usar URL
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <p className="text-xs text-gray-500">
            Puedes subir una imagen al MinIO o pegar una URL directa para que
            se vea en el admin y en la tienda.
          </p>
          <p className="text-xs text-amber-600">
            Si pegas una URL externa, procura que sea directa y no una pagina
            intermedia.
          </p>
        </div>
      )}
    </div>
  );
}
