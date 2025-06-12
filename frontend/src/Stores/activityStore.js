import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useActivities = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["activities", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/activities", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useActivity = (activityId) => {
  return useQuery({
    queryKey: ["activity", activityId],
    queryFn: async () => {
      const { data } = await api.get(`/activities/${activityId}`);
      return data;
    },
  });
};

export const usePopularActivities = (limit = 4) => {
  return useQuery({
    queryKey: ["activities", "popular", { limit }],
    queryFn: async () => {
      const { data } = await api.get("/activities", {
        params: { sort: "popularity", limit },
      });
      return data;
    },
  });
};

// Mutations (Admin only)
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData) => {
      const { data } = await api.post("/activities", activityData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["activities"]);
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, activityData }) => {
      const { data } = await api.put(`/activities/${activityId}`, activityData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["activity", data.id]);
      queryClient.invalidateQueries(["activities"]);
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId) => {
      const { data } = await api.delete(`/activities/${activityId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["activities"]);
      queryClient.removeQueries(["activity", data.id]);
    },
  });
};
