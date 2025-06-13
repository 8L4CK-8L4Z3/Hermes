import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useFollowSuggestions = (page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["follows", "suggestions", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/follows/suggestions", {
        params: {
          page,
          limit,
          include: ["user_stats", "mutual_followers_count"],
        },
      });
      return data;
    },
    keepPreviousData: true, // Keep previous data while fetching next page
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...options,
  });
};

export const useFollowers = (userId, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["follows", "followers", userId, { page, limit }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const { data } = await api.get(`/follows/${userId}/followers`, {
        params: {
          page,
          limit,
          include: ["user_stats", "is_following"],
        },
      });
      return data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && options?.enabled !== false,
    ...options,
  });
};

export const useFollowing = (userId, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["follows", "following", userId, { page, limit }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const { data } = await api.get(`/follows/${userId}/following`, {
        params: {
          page,
          limit,
          include: ["user_stats", "is_following"],
        },
      });
      return data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && options?.enabled !== false,
    ...options,
  });
};

export const useFollowStats = (userId, options = {}) => {
  const queryClient = useQueryClient();
  const followersData = queryClient.getQueryData([
    "follows",
    "followers",
    userId,
  ]);
  const followingData = queryClient.getQueryData([
    "follows",
    "following",
    userId,
  ]);

  return useQuery({
    queryKey: ["follows", "stats", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      // If we already have the data from followers/following queries, use that
      if (followersData?.meta?.pagination && followingData?.meta?.pagination) {
        return {
          followers_count: followersData.meta.pagination.total,
          following_count: followingData.meta.pagination.total,
        };
      }
      const { data } = await api.get(`/follows/${userId}/stats`);
      return data;
    },
    enabled:
      !!userId &&
      (!followersData || !followingData) &&
      options?.enabled !== false,
    ...options,
  });
};

export const useMutualFollowers = (
  userId,
  page = 1,
  limit = 10,
  options = {}
) => {
  return useQuery({
    queryKey: ["follows", "mutual", userId, { page, limit }],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const { data } = await api.get(`/follows/${userId}/mutual`, {
        params: { page, limit },
      });
      return data;
    },
    enabled: !!userId && options?.enabled !== false,
    ...options,
  });
};

// Mutations
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      if (!userId) {
        throw new Error("User ID is required");
      }
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
      if (!userId) {
        throw new Error("User ID is required");
      }
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
