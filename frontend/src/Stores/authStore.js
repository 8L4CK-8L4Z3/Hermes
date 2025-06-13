import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/refresh-token");
      if (data.token) {
        localStorage.setItem("token", "Bearer " + data.token);
      }
      return data;
    },
  });
};
// Mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
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
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/logout");
      localStorage.removeItem("token");
      return data;
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
