import { useEffect, useState } from "react";
import { segmentsApi } from "../services/segment-service";

export const useSegments = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await segmentsApi.getAll();
      setSegments(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  return { segments, loading, error, refetch: fetchSegments };
};
