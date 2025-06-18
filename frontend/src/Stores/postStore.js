import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";
import postSchema from "@/Schemas/postSchema";

// Queries
export const usePost = (postId) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`);
      return data;
    },
    enabled: !!postId,
  });
};

export const useFeed = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "feed", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/posts/feed", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useUserPosts = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "user", userId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/posts/user/${userId}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePostsByType = (type, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "type", type, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/posts/type/${type}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const usePostsByLocation = (location, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "location", location, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/posts/location", {
        params: { location, page, limit },
      });
      return data;
    },
  });
};

export const usePostsByTags = (tags, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "tags", tags, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/posts/tags", {
        params: { tags, page, limit },
      });
      return data;
    },
  });
};

export const usePostsByVisibility = (visibility, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["posts", "visibility", visibility, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/posts/visibility/${visibility}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

// Mutations
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData) => {
      // Validate post data
      const validatedData = postSchema.parse(postData);
      const { data } = await api.post("/posts", validatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error("Failed to create post:", error);
      throw error;
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, postData }) => {
      const { data } = await api.put(`/posts/${postId}`, postData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["post", data.id]);
      queryClient.invalidateQueries(["posts"]);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const { data } = await api.delete(`/posts/${postId}`);
      return data;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.removeQueries(["post", postId]);
    },
  });
};

export const useUpdatePostVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, visibility }) => {
      const { data } = await api.patch(`/posts/${postId}/visibility`, {
        visibility,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["post", data.id]);
      queryClient.invalidateQueries(["posts"]);
    },
  });
};

export const useUpdatePostType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, type }) => {
      const { data } = await api.patch(`/posts/${postId}/type`, { type });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["post", data.id]);
      queryClient.invalidateQueries(["posts"]);
    },
  });
};

export const useUpdatePostLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, location }) => {
      const { data } = await api.patch(`/posts/${postId}/location`, {
        location,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["post", data.id]);
      queryClient.invalidateQueries(["posts"]);
    },
  });
};
