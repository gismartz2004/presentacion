import service from "./service";

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await service.post(`/upload`, formData);
  return response.data;
};

export { uploadImage };
