import { useState, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import productsService from "../api/products-service";
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
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsUploading(true);
    try {
      const response = await productsService.uploadImage(file);
      if (response.status === "success") {
        onChange(response.url);
        toast.success("Imagen subida exitosamente");
      } else {
        toast.error(response.error || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
      setShowUrlInput(false);
      toast.success("URL de imagen agregada");
    }
  };

  const removeImage = () => {
    onChange("");
    toast.success("Imagen removida");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        Imagen del Producto
      </label>

      {/* Vista previa de la imagen */}
      {value && (
        <div className="relative inline-block">
          <img
            src={getImageUrl(value)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
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
          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Upload size={16} />
              )}
              {isUploading ? "Subiendo..." : "Subir Imagen"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2"
            >
              <ImageIcon size={16} />
              URL
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

          {/* Input de URL */}
          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
              >
                Agregar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Información adicional */}
          <p className="text-xs text-gray-500">
            Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>
        </div>
      )}
    </div>
  );
}
