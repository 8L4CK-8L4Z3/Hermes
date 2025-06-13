import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Helper function to check if user is authenticated and get user data
export const checkAuth = async () => {
  try {
    const { data } = await api.get("/users/me", {
      params: {
        include: [
          "preferences",
          "stats",
          "isAdmin",
          "isMod",
          "isVerified",
          "lastLogin",
        ],
      },
    });

    return {
      isAuthenticated: true,
      user: {
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
        isAdmin: Boolean(data.isAdmin),
        isMod: Boolean(data.isMod),
        isVerified: Boolean(data.isVerified),
        lastLogin: data.lastLogin || new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return { isAuthenticated: false, user: null };
    }
    throw error;
  }
};

// Queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { user } = await checkAuth();
      return user;
    },
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/refresh-token");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post("/auth/register", userData);
      return data;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/logout");
      return data;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, password }) => {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      return data;
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token) => {
      const { data } = await api.post(`/auth/verify-email/${token}`);
      return data;
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (passwords) => {
      const { data } = await api.put("/auth/update-password", passwords);
      return data;
    },
  });
};
