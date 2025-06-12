import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../Utils/api";

// Queries
export const useComment = (commentId) => {
  return useQuery({
    queryKey: ["comment", commentId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}`);
      return data;
    },
  });
};

export const usePostComments = (postId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["comments", "post", postId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/comments/post/${postId}`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useCommentReplies = (commentId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["comments", "replies", commentId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}/replies`, {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useCommentThread = (commentId) => {
  return useQuery({
    queryKey: ["comments", "thread", commentId],
    queryFn: async () => {
      const { data } = await api.get(`/comments/${commentId}/thread`);
      return data;
    },
  });
};

// Mutations
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      const { data } = await api.post("/comments", commentData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comments", "post", data.post_id]);
      if (data.parent_comment_id) {
        queryClient.invalidateQueries([
          "comments",
          "replies",
          data.parent_comment_id,
        ]);
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }) => {
      const { data } = await api.put(`/comments/${commentId}`, { content });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comment", data.id]);
      queryClient.invalidateQueries(["comments", "post", data.post_id]);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const { data } = await api.delete(`/comments/${commentId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comments", "post", data.post_id]);
      queryClient.removeQueries(["comment", data.id]);
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comment", data.comment_id]);
    },
  });
};

export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const { data } = await api.post(`/comments/${commentId}/unlike`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comment", data.comment_id]);
    },
  });
};

export const useUpdateCommentContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }) => {
      const { data } = await api.patch(`/comments/${commentId}/content`, {
        content,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["comment", data.id]);
      queryClient.invalidateQueries(["comments", "post", data.post_id]);
    },
  });
};
