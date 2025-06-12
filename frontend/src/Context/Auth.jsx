import { createContext } from "react";

// Create auth context with default values
export const AuthContext = createContext({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});