const path = require("path");
const SftpClient = require("ssh2-sftp-client");
const minioClient = require("../lib/s3Config");

const STORAGE_TYPE = String(process.env.STORAGE_TYPE || "minio").toLowerCase();

function trimSlashes(value = "") {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function normalizePublicBaseUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/g, "");
}

function encodePublicPath(objectName) {
  return String(objectName || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getMinioConfig() {
  const bucketName = process.env.MINIO_BUCKET || "difiori";
  const publicBaseUrl =
    normalizePublicBaseUrl(process.env.MINIO_PUBLIC_URL) ||
    `http://66.94.98.69:9000/${bucketName}`;

  return { bucketName, publicBaseUrl };
}

function getSftpConfig() {
  return {
    host: process.env.FTP_HOST,
    port: Number(process.env.FTP_PORT || 22),
    username: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    remotePath: String(process.env.FTP_REMOTE_PATH || "").replace(/\/+$/g, ""),
    publicBaseUrl: normalizePublicBaseUrl(process.env.FTP_PUBLIC_URL),
  };
}

async function ensureMinioBucket(bucketName) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
  }
}

async function uploadToMinio({ objectName, buffer, contentType }) {
  const { bucketName, publicBaseUrl } = getMinioConfig();

  await ensureMinioBucket(bucketName);
  await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  return {
    url: `${publicBaseUrl}/${encodePublicPath(objectName)}`,
    objectName,
    storageType: "minio",
  };
}

async function uploadToSftp({ objectName, buffer }) {
  const config = getSftpConfig();

  if (
    !config.host ||
    !config.username ||
    !config.password ||
    !config.remotePath ||
    !config.publicBaseUrl
  ) {
    throw new Error("Configuracion SFTP incompleta");
  }

  const sftp = new SftpClient();
  const normalizedObjectName = trimSlashes(objectName);
  const remoteFilePath = `${config.remotePath}/${normalizedObjectName}`;
  const remoteDir = path.posix.dirname(remoteFilePath);

  try {
    await sftp.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    });
    await sftp.mkdir(remoteDir, true);
    await sftp.put(buffer, remoteFilePath);
  } finally {
    await sftp.end().catch(() => undefined);
  }

  return {
    url: `${config.publicBaseUrl}/${encodePublicPath(normalizedObjectName)}`,
    objectName: normalizedObjectName,
    storageType: "sftp",
  };
}

async function uploadBuffer({ objectName, buffer, contentType }) {
  if (STORAGE_TYPE === "sftp") {
    return uploadToSftp({ objectName, buffer, contentType });
  }

  return uploadToMinio({ objectName, buffer, contentType });
}

module.exports = {
  uploadBuffer,
};
