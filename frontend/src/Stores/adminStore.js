import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const { data } = await api.get("/admin/stats", {
        params: {
          inactiveThreshold: thirtyDaysAgo.toISOString(),
        },
      });
      return data;
    },
  });
};

export const useAllUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["admin", "users", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useModerationLogs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["admin", "moderation-logs", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/admin/moderation-logs", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useAdminAnalytics = (days = 30) => {
  return useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await api.post("/admin/analytics", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return data;
    },
  });
};

export const useReportedContent = (
  page = 1,
  limit = 10,
  status = "pending"
) => {
  return useQuery({
    queryKey: ["admin", "reported-content", { page, limit, status }],
    queryFn: async () => {
      const params = { page, limit };
      if (status !== "all") {
        params.status = status;
      }
      const { data } = await api.get("/admin/reported-content", {
        params,
      });
      return data;
    },
  });
};

// Mutations
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.put(`/admin/users/${userId}/role`, role);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["admin", "users"]);
      queryClient.invalidateQueries(["user", variables.userId]);

      queryClient.setQueryData(["admin", "users"], (oldData) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((user) =>
            user._id === variables.userId
              ? { ...user, ...variables.role }
              : user
          ),
        };
      });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["admin", "users"]);
      queryClient.invalidateQueries(["user", variables]);
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.put(`/admin/users/${userId}/unban`);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["admin", "users"]);
      queryClient.invalidateQueries(["user", variables]);
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useModerateReportedContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, action, reason }) => {
      const { data } = await api.put(`/admin/reported-content/${contentId}`, {
        action,
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "reported-content"]);
      queryClient.invalidateQueries(["moderation", "reports"]);
    },
  });
};
