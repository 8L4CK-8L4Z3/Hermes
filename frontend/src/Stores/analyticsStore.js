import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useUserAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "users"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/users");
      return data;
    },
  });
};

export const useContentAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "content"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/content");
      return data;
    },
  });
};

export const useDestinationAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "destinations"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/destinations");
      return data;
    },
  });
};

export const usePlaceAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "places"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/places");
      return data;
    },
  });
};

export const useSearchAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "search"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/search");
      return data;
    },
  });
};

export const useAnalyticsByDate = (date) => {
  return useQuery({
    queryKey: ["analytics", "date", date],
    queryFn: async () => {
      const { data } = await api.get("/analytics/date", {
        params: { date },
      });
      return data;
    },
  });
};

export const useAnalyticsByMetric = (metricName) => {
  return useQuery({
    queryKey: ["analytics", "metric", metricName],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/metric/${metricName}`);
      return data;
    },
  });
};

export const usePopularContent = () => {
  return useQuery({
    queryKey: ["analytics", "content", "popular"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/content/popular");
      return data;
    },
  });
};

// Mutations
export const useUpdateDailyMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics) => {
      const { data } = await api.post("/analytics/metrics/daily", metrics);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["analytics"]);
    },
  });
};

export const useUpdatePopularDestinations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinations) => {
      const { data } = await api.post(
        "/analytics/destinations/popular",
        destinations
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["analytics", "destinations"]);
    },
  });
};

export const useUpdatePopularPlaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (places) => {
      const { data } = await api.post("/analytics/places/popular", places);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["analytics", "places"]);
    },
  });
};
