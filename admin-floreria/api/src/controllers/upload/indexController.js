const cloudinary = require("../../lib/cloudinary");
const streamifier = require("streamifier");
const fs = require("fs");

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "No se encontro archivo",
      });
    }

    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      return res.status(400).json({
        status: "error",
        message: "Solo se permiten imagenes o videos",
      });
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        status: "error",
        message: `El archivo es demasiado grande (maximo ${isVideo ? "50MB" : "5MB"})`,
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        status: "error",
        message:
          "Cloudinary no esta configurado en el servidor. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el archivo .env del API.",
      });
    }

    const uploadOptions = {
      folder: isVideo ? "perfumeria/videos" : "perfumeria/products",
      resource_type: "auto",
    };

    if (isImage) {
      uploadOptions.transformation = [
        { width: 1000, height: 1000, crop: "limit", quality: "auto" },
      ];
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    return res.status(200).json({
      status: "success",
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      message: isVideo ? "Video subido exitosamente" : "Imagen subida exitosamente",
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
    });
  }
};
