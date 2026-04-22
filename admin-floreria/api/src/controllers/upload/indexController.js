const fs = require("fs");
const minioClient = require("../../lib/s3Config");

const BUCKET_NAME = "difiori";
const PUBLIC_BASE_URL = "http://66.94.98.69:9000";

async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
  }
}

function sanitizeFileName(originalName = "") {
  return originalName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
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

    await ensureBucketExists();

    const folderName = isVideo ? "videos" : "images";
    const safeName = sanitizeFileName(file.originalname || "archivo");
    const objectName = `${folderName}/${Date.now()}-${safeName}`;

    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    const objectPath = objectName
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const fileUrl = `${PUBLIC_BASE_URL}/${BUCKET_NAME}/${objectPath}`;

    return res.status(200).json({
      status: "success",
      url: fileUrl,
      public_id: objectName,
      resource_type: isVideo ? "video" : "image",
      message: isVideo
        ? "Video subido exitosamente a MinIO"
        : "Imagen subida exitosamente a MinIO",
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
