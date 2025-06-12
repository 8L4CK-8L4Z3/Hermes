import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useReports = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["moderation", "reports", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/moderation/reports", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useModerationQueue = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["moderation", "queue", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/moderation/queue", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useModerationHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["moderation", "history", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/moderation/history", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useModeratorStats = () => {
  return useQuery({
    queryKey: ["moderation", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/moderation/stats");
      return data;
    },
  });
};

// Mutations
export const useReportContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportData) => {
      const { data } = await api.post("/moderation/report", reportData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["moderation", "reports"]);
    },
  });
};

export const useHandleReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, action }) => {
      const { data } = await api.put(`/moderation/reports/${reportId}`, {
        action,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["moderation", "reports"]);
      queryClient.invalidateQueries(["moderation", "queue"]);
      queryClient.invalidateQueries(["moderation", "history"]);
    },
  });
};

export const useLogModerationAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionData) => {
      const { data } = await api.post("/moderation/log", actionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["moderation", "history"]);
      queryClient.invalidateQueries(["moderation", "stats"]);
    },
  });
};
