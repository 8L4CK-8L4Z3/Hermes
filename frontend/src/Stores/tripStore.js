import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/Utils/api";

// Queries
export const useTrip = (tripId) => {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}`);
      return data;
    },
  });
};

export const usePublicTrips = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["trips", "public", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/trips/public", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useUserTrips = (userId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["trips", "user", userId, { page, limit }],
    queryFn: async () => {
      if (!userId) {
        return { data: [], meta: { page, limit, total: 0 } };
      }
      console.log("Fetching trips for user:", userId);
      const { data } = await api.get(`/trips/user/${userId}`, {
        params: { page, limit },
      });
      console.log("Received trips data:", data);
      return data;
    },
    enabled: !!userId,
  });
};

export const useTripActivities = (tripId) => {
  return useQuery({
    queryKey: ["trip", tripId, "activities"],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/activities`);
      return data;
    },
  });
};

export const useTripTimeline = (tripId) => {
  return useQuery({
    queryKey: ["trip", tripId, "timeline"],
    queryFn: async () => {
      const { data } = await api.get(`/trips/${tripId}/timeline`);
      return data;
    },
  });
};

// Mutations
export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData) => {
      const { data } = await api.post("/trips", tripData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trips"]);
      queryClient.invalidateQueries(["trips", "user", data.user_id]);
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, tripData }) => {
      const { data } = await api.put(`/trips/${tripId}`, tripData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.id]);
      queryClient.invalidateQueries(["trips", "user", data.user_id]);
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId) => {
      const { data } = await api.delete(`/trips/${tripId}`);
      return data;
    },
    onSuccess: (_, tripId) => {
      queryClient.invalidateQueries(["trips"]);
      queryClient.removeQueries(["trip", tripId]);
    },
  });
};

export const useAddDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, destinationData }) => {
      const { data } = await api.post(
        `/trips/${tripId}/destinations`,
        destinationData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.trip_id]);
    },
  });
};

export const useRemoveDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, destinationId }) => {
      const { data } = await api.delete(
        `/trips/${tripId}/destinations/${destinationId}`
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.trip_id]);
    },
  });
};

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, status }) => {
      const { data } = await api.patch(`/trips/${tripId}/status`, { status });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.id]);
    },
  });
};

export const useUpdateTripBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, budget }) => {
      const { data } = await api.patch(`/trips/${tripId}/budget`, { budget });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.id]);
    },
  });
};

export const useAddActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, activityData }) => {
      const { data } = await api.post(
        `/trips/${tripId}/activities`,
        activityData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.trip_id]);
      queryClient.invalidateQueries(["trip", data.trip_id, "activities"]);
    },
  });
};

export const useRemoveActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, activityId }) => {
      const { data } = await api.delete(
        `/trips/${tripId}/activities/${activityId}`
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.trip_id]);
      queryClient.invalidateQueries(["trip", data.trip_id, "activities"]);
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, activityId, activityData }) => {
      const { data } = await api.patch(
        `/trips/${tripId}/activities/${activityId}`,
        activityData
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.trip_id]);
      queryClient.invalidateQueries(["trip", data.trip_id, "activities"]);
    },
  });
};

export const useUpdateTripVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, visibility }) => {
      const { data } = await api.patch(`/trips/${tripId}/visibility`, {
        visibility,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.id]);
      queryClient.invalidateQueries(["trips", "public"]);
    },
  });
};

export const useShareTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, shareData }) => {
      const { data } = await api.post(`/trips/${tripId}/share`, shareData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["trip", data.id]);
    },
  });
};
