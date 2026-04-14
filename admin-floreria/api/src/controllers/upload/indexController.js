const cloudinary = require('../../lib/cloudinary');
const streamifier = require('streamifier');

exports.uploadFile = async (req, res) => {
  try {
    // El archivo ya está disponible en req.file gracias a multer
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "No se encontró archivo"
      });
    }

    // Validar tipo de archivo (imágenes o videos)
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return res.status(400).json({
        status: "error",
        message: "Solo se permiten imágenes o videos"
      });
    }

    // Validar tamaño (max 5MB para imágenes, 50MB para videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        status: "error",
        message: `El archivo es demasiado grande (máximo ${isVideo ? '50MB' : '5MB'})`
      });
    }

    // Configuración para Cloudinary según el tipo
    const uploadOptions = {
      folder: isVideo ? 'perfumeria/videos' : 'perfumeria/products',
      resource_type: 'auto',
    };

    // Solo agregar transformaciones para imágenes
    if (isImage) {
      uploadOptions.transformation = [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ];
    }

    // Subir a Cloudinary desde el buffer en memoria usando stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convertir el buffer a stream y subirlo
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    // Retornar URL de Cloudinary
    return res.status(200).json({
      status: "success",
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      message: isVideo ? "Video subido exitosamente" : "Imagen subida exitosamente"
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      status: "error",
      message: error.message || "Error interno del servidor"
    });
  }
};
