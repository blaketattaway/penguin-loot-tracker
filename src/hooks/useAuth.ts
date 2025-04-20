import { createContext, useContext } from "react";

interface AuhtContextType {
  isValid: boolean;
  checkTokenValidity: () => void;
}

const initialContext: AuhtContextType = {
  isValid: false,
  checkTokenValidity: () => {},
};

export const AuthContext = createContext<AuhtContextType>(initialContext);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth should use within <AuthProvider>");
  return context;
};

export default useAuth;
