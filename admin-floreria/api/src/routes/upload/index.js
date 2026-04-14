const express = require("express");

const uploadController = require("../../controllers/upload/indexController");

const router = express.Router();

const multer = require("multer");

// Usar memoryStorage en lugar de diskStorage para no escribir en disco
// El archivo queda en memoria (req.file.buffer) hasta subirlo a Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo (para videos)
  }
});

// Endpoint para subir archivos
router.post("/", upload.single("file"), uploadController.uploadFile);

module.exports = router;
