import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/profile/${userId}`);
      return data;
    },
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
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/stats`);
      return data;
    },
  });
};

export const useUserActivity = (userId) => {
  return useQuery({
    queryKey: ["userActivity", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/activity`);
      return data;
    },
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
      const { data } = await api.put("/users/profile", profileData);
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
      const { data } = await api.put("/users/preferences", preferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoData) => {
      const formData = new FormData();
      formData.append("photo", photoData);
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
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const { data } = await api.get("/users/preferences");
      return data;
    },
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
