import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useContentLikes = (type, id, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["likes", "content", type, id, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/likes/content/${type}/${id}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useLikesByType = (type, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["likes", "type", type, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/likes/type/${type}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useUserLikes = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["likes", "user", userId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/likes/user/${userId}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useUserLikedContent = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["likes", "user", userId, "content", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/likes/user/${userId}/content`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations
export const useLikeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, targetId }) => {
      const { data } = await api.post("/likes", {
        target_type: type,
        target_id: targetId,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries([
        "likes",
        "content",
        data.target_type,
        data.target_id,
      ]);
      queryClient.invalidateQueries(["likes", "user", data.user_id]);
      // Invalidate the target content's queries
      queryClient.invalidateQueries([
        data.target_type.toLowerCase(),
        data.target_id,
      ]);
    },
  });
};

export const useUnlikeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, targetId }) => {
      const { data } = await api.delete("/likes", {
        data: { target_type: type, target_id: targetId },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries([
        "likes",
        "content",
        data.target_type,
        data.target_id,
      ]);
      queryClient.invalidateQueries(["likes", "user", data.user_id]);
      // Invalidate the target content's queries
      queryClient.invalidateQueries([
        data.target_type.toLowerCase(),
        data.target_id,
      ]);
    },
  });
};
