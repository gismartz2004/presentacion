import service from "./service";
import type { User } from "@/store/use-user-store";

type MetadataResponse = {
  status: "success" | "error";
  data?: { admin?: User };
  message?: string;
};

export default async function metadataService(opts?: { signal?: AbortSignal }) {
  const response = await service.get<MetadataResponse>("/admin/metadata", {
    signal: opts?.signal,
  });
  return response.data;
}
