import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Review {
  id?: string;
  name: string;
  content: string;
  stars: number;
  role?: string;
  createdAt?: string;
}

const API_URL = "/api/external/reviews";

export function useReviews() {
  return useQuery<Review[], Error>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar reseñas");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReview: Review) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error("Error al enviar reseña");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
