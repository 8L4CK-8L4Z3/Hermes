import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/profile/${userId}`, {
        params: {
          include: [
            "stats",
            "preferences",
            "isAdmin",
            "isMod",
            "isVerified",
            "lastLogin",
          ],
        },
      });
      return data;
    },
    select: (data) => ({
      ...data,
      stats: data.stats || {
        tripsCount: 0,
        reviewsCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
      preferences: data.preferences || {
        language: "en",
        notifications: {
          email: true,
          push: true,
        },
      },
    }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUserFollowers = (userId) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/followers`);
      return data;
    },
  });
};

export const useUserFollowing = (userId) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/following`);
      return data;
    },
  });
};

export const useUserStats = (userId) => {
  const { data: profile } = useUserProfile(userId);

  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      if (profile?.stats) {
        return profile.stats;
      }
      const { data } = await api.get(`/users/${userId}/stats`);
      return (
        data || {
          tripsCount: 0,
          reviewsCount: 0,
          followersCount: 0,
          followingCount: 0,
        }
      );
    },
    enabled: !profile?.stats,
  });
};

export const useUserActivity = (userId) => {
  const { data: profile } = useUserProfile(userId);

  return useQuery({
    queryKey: ["userActivity", userId],
    queryFn: async () => {
      if (profile?.activity) {
        return profile.activity;
      }
      const { data } = await api.get(`/users/${userId}/activity`);
      return data;
    },
    enabled: !profile?.activity,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });
};

// Mutations
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      // Only allow updating fields that are in the User model
      const allowedFields = {
        username: profileData.username,
        email: profileData.email,
        bio: profileData.bio,
        image: profileData.image,
        ...(profileData.preferences && {
          preferences: {
            language: profileData.preferences.language,
            notifications: profileData.preferences.notifications,
          },
        }),
      };

      const { data } = await api.put("/users/profile", allowedFields);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user", data.id]);
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete("/users/profile");
      return data;
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.clear();
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences) => {
      // Match the User model preferences structure
      const validPreferences = {
        language: preferences.language || "en",
        notifications: {
          email: preferences.notifications?.email ?? true,
          push: preferences.notifications?.push ?? true,
        },
      };

      const { data } = await api.put("/users/preferences", validPreferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
      queryClient.invalidateQueries(["userPreferences"]);
    },
  });
};

export const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageData) => {
      const formData = new FormData();
      formData.append("image", imageData);
      const { data } = await api.put("/users/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user", data.id]);
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useUpdateLastLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put("/users/last-login");
      return data;
    },
  });
};

export const useUpdateUserStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stats) => {
      const { data } = await api.put("/users/stats", stats);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["userStats", data.id]);
    },
  });
};

export const useUserPreferences = () => {
  const { data: profile } = useCurrentUser();

  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      if (profile?.preferences) {
        return profile.preferences;
      }
      const { data } = await api.get("/users/preferences");
      return data;
    },
    enabled: !profile?.preferences,
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.put(`/users/${userId}/verify`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user", data.id]);
    },
  });
};
