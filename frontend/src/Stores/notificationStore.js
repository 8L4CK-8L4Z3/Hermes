import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Utils/api";

// Queries
export const useNotifications = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/notifications", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread", "count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread/count");
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useNotificationsByType = (type, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", "type", type, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/type/${type}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread", "count"]);
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/notifications/read-all");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread", "count"]);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await api.delete(`/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread", "count"]);
    },
  });
};

export const useUpdateNotificationReadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId, isRead }) => {
      const { data } = await api.patch(
        `/notifications/${notificationId}/status`,
        {
          is_read: isRead,
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread", "count"]);
    },
  });
};

// Admin Mutations
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData) => {
      const { data } = await api.post("/notifications", notificationData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

export const useCleanupNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/notifications/cleanup");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread", "count"]);
    },
  });
};
