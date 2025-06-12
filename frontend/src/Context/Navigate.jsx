import { createContext } from "react";

// Create navigation context with default values
export const NavigationContext = createContext({
  currentPage: "home",
  navigate: () => {},
  pageParams: {},
});
