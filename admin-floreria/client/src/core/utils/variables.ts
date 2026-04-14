const IMG_URL = import.meta.env.VITE_URL_IMG;

/**
 * Helper para obtener la URL completa de una imagen
 * Detecta si es URL de Cloudinary (completa) o relativa (legacy)
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/placeholder-image.svg";
  
  // Si ya es una URL completa (Cloudinary o externa)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Asegurar que IMG_URL no termine en / y imagePath empiece con /
  const baseUrl = IMG_URL?.endsWith("/") ? IMG_URL.slice(0, -1) : IMG_URL;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
}

export { IMG_URL };
