import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useFollowSuggestions = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["follows", "suggestions", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/follows/suggestions", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useFollowers = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["follows", "followers", userId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/follows/${userId}/followers`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useFollowing = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["follows", "following", userId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/follows/${userId}/following`, {
        params: { page, limit },
      });
      return data;
    },
  });
};



export const useFollowStats = (userId) => {
  return useQuery({
    queryKey: ["follows", "stats", userId],
    queryFn: async () => {
      const { data } = await api.get(`/follows/${userId}/stats`);
      return data;
    },
  });
};

export const useMutualFollowers = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["follows", "mutual", userId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/follows/${userId}/mutual`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post(`/follows/${userId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["follows"]);
      queryClient.invalidateQueries(["user", data.followed_id]);
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.delete(`/follows/${userId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["follows"]);
      queryClient.invalidateQueries(["user", data.unfollowed_id]);
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};
