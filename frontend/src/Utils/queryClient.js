import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Make queryClient globally accessible for interceptors
if (typeof window !== "undefined") {
  window.__queryClient = queryClient;
}

export default queryClient;
