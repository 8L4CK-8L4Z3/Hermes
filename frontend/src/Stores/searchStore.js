import { useQuery } from "@tanstack/react-query";
import api from "../Utils/api";

export const useGlobalSearch = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["search", "global", query, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/search", {
        params: { query, page, limit },
      });
      return data;
    },
    enabled: !!query, // Only run the query if there's a search term
  });
};

export const useDestinationSearch = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["search", "destinations", query, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/search/destinations", {
        params: { query, page, limit },
      });
      return data;
    },
    enabled: !!query,
  });
};

export const usePlaceSearch = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["search", "places", query, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/search/places", {
        params: { query, page, limit },
      });
      return data;
    },
    enabled: !!query,
  });
};

export const useUserSearch = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["search", "users", query, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/search/users", {
        params: { query, page, limit },
      });
      return data;
    },
    enabled: !!query,
  });
};

export const usePostSearch = (query, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["search", "posts", query, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/search/posts", {
        params: { query, page, limit },
      });
      return data;
    },
    enabled: !!query,
  });
};

export const useSearchSuggestions = (query) => {
  return useQuery({
    queryKey: ["search", "suggestions", query],
    queryFn: async () => {
      const { data } = await api.get("/search/suggestions", {
        params: { query },
      });
      return data;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // Consider suggestions fresh for 5 minutes
  });
};
