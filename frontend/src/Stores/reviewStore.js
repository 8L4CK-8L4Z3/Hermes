import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useReview = (reviewId) => {
  return useQuery({
    queryKey: ["review", reviewId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${reviewId}`);
      return data;
    },
  });
};

export const useReviews = (placeId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["reviews", placeId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/reviews`, {
        params: { place_id: placeId, page, limit },
      });
      return data;
    },
  });
};

export const useHelpfulReviews = (placeId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["reviews", "helpful", placeId, { page, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/helpful`, {
        params: { place_id: placeId, page, limit },
      });
      return data;
    },
  });
};

export const useReviewsByVisitDate = (
  placeId,
  startDate,
  endDate,
  page = 1,
  limit = 10
) => {
  return useQuery({
    queryKey: [
      "reviews",
      "by-date",
      placeId,
      startDate,
      endDate,
      { page, limit },
    ],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/by-date`, {
        params: {
          place_id: placeId,
          start_date: startDate,
          end_date: endDate,
          page,
          limit,
        },
      });
      return data;
    },
  });
};

// Mutations
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await api.post("/reviews", reviewData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["reviews", data.place_id]);
      queryClient.invalidateQueries(["place", data.place_id]);
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reviewData }) => {
      const { data } = await api.put(`/reviews/${reviewId}`, reviewData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["review", data.id]);
      queryClient.invalidateQueries(["reviews", data.place_id]);
      queryClient.invalidateQueries(["place", data.place_id]);
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const { data } = await api.delete(`/reviews/${reviewId}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["reviews", data.place_id]);
      queryClient.invalidateQueries(["place", data.place_id]);
      queryClient.removeQueries(["review", data.id]);
    },
  });
};

export const useLikeReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const { data } = await api.post(`/reviews/${reviewId}/like`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["review", data.review_id]);
    },
  });
};

export const useUnlikeReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const { data } = await api.post(`/reviews/${reviewId}/unlike`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["review", data.review_id]);
    },
  });
};
