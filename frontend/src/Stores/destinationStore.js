import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useDestination = (destinationId) => {
  return useQuery({
    queryKey: ["destination", destinationId],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/${destinationId}`);
      return data;
    },
  });
};

export const usePopularDestinations = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["destinations", "popular", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/destinations/popular", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useNearbyDestinations = (
  latitude,
  longitude,
  radius,
  page = 1,
  limit = 10
) => {
  return useQuery({
    queryKey: [
      "destinations",
      "nearby",
      { latitude, longitude, radius, page, limit },
    ],
    queryFn: async () => {
      const { data } = await api.get("/destinations/nearby", {
        params: { latitude, longitude, radius, page, limit },
      });
      return data;
    },
  });
};

export const useDestinationStats = (destinationId) => {
  return useQuery({
    queryKey: ["destination", destinationId, "stats"],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/${destinationId}/stats`);
      return data;
    },
  });
};

export const useDestinationPlaces = (destinationId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["destination", destinationId, "places", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/destinations/${destinationId}/places`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useAllDestinations = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["destinations", "all", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/destinations/search", {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations (Admin only)
export const useCreateDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinationData) => {
      const { data } = await api.post("/destinations", destinationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["destinations"]);
    },
  });
};

export const useUpdateDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ destinationId, destinationData }) => {
      const { data } = await api.put(
        `/destinations/${destinationId}`,
        destinationData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["destination", data.id]);
      queryClient.invalidateQueries(["destinations"]);
    },
  });
};

export const useDeleteDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinationId) => {
      const { data } = await api.delete(`/destinations/${destinationId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["destinations"]);
      queryClient.removeQueries(["destination", data.id]);
    },
  });
};

export const useUpdateDestinationPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ destinationId, photo }) => {
      const formData = new FormData();
      formData.append("photo", photo);
      const { data } = await api.put(
        `/destinations/${destinationId}/photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["destination", data.id]);
    },
  });
};
