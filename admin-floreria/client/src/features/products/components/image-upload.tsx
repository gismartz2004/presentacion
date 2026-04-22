import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { X, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/core/utils/variables";

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

  const looksLikeDirectImageUrl = (url: string) => {
    if (url.startsWith("/")) return true;
    if (url.startsWith("data:image/")) return true;
    return /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(url);
  };

  useEffect(() => {
    setUrlInput(value || "");
    setPreviewError(false);
  }, [value]);

  const handleUrlSubmit = () => {
    const nextUrl = urlInput.trim();

    if (!nextUrl) {
      toast.error("Ingresa una URL de imagen");
      return;
    }

    onChange(nextUrl);

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
              La URL no apunta a una imagen directa
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

          <p className="text-xs text-gray-500">
            Pega la URL completa de la imagen para que se vea en el admin y en
            la tienda.
          </p>
          <p className="text-xs text-amber-600">
            Ejemplo valido: una URL directa que termine en `.jpg`, `.png`,
            `.webp` o similar. Enlaces como `ibb.co/...` suelen ser paginas, no
            la imagen real.
          </p>
        </div>
      )}
    </div>
  );
}
