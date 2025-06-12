import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const usePlace = (placeId) => {
  return useQuery({
    queryKey: ["place", placeId],
    queryFn: async () => {
      const { data } = await api.get(`/places/${placeId}`);
      return data;
    },
  });
};

export const usePlacesByType = (type, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["places", "type", type, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/places/type/${type}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePlacesByDestination = (destinationId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["places", "destination", destinationId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/places/destination/${destinationId}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePopularPlaces = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["places", "popular", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/places/popular", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePlaceStats = (placeId) => {
  return useQuery({
    queryKey: ["place", placeId, "stats"],
    queryFn: async () => {
      const { data } = await api.get(`/places/${placeId}/stats`);
      return data;
    },
  });
};

export const usePlacesByPriceRange = (priceRange, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["places", "price", priceRange, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/places/price/${priceRange}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePlacesByOpeningHours = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["places", "hours", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/places/hours", {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations (Admin only)
export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeData) => {
      const { data } = await api.post("/places", placeData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["places"]);
      queryClient.invalidateQueries([
        "places",
        "destination",
        data.destination_id,
      ]);
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ placeId, placeData }) => {
      const { data } = await api.put(`/places/${placeId}`, placeData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["place", data.id]);
      queryClient.invalidateQueries([
        "places",
        "destination",
        data.destination_id,
      ]);
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (placeId) => {
      const { data } = await api.delete(`/places/${placeId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["places"]);
      queryClient.invalidateQueries([
        "places",
        "destination",
        data.destination_id,
      ]);
      queryClient.removeQueries(["place", data.id]);
    },
  });
};

export const useUpdatePlaceRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ placeId, rating }) => {
      const { data } = await api.patch(`/places/${placeId}/rating`, { rating });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["place", data.id]);
    },
  });
};
