import { createContext } from "react";

export interface AuhtContextType {
  isValid: boolean;
  checkTokenValidity: () => void;
}

export const AuthContext = createContext<AuhtContextType | null>(null);