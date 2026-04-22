const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "66.94.98.69",
  port: 9000,
  useSSL: false,
  accessKey: "Difiori-access-key",
  secretKey: "web-admin-123",
});

module.exports = minioClient;
