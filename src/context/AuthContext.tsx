import { PropsWithChildren, useEffect, useState } from "react";
import { AuthContext } from "../hooks/useAuth";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [isValid, setIsValid] = useState(false);
  const checkTokenValidity = () => {
    const token = localStorage.getItem("plt-token");
    const expiration = localStorage.getItem("plt-token-expiration");
    setIsValid(!!token && !!expiration && new Date(expiration) > new Date());
  };

  useEffect(() => {
    checkTokenValidity();

    const handleStorageChange = () => checkTokenValidity();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isValid, checkTokenValidity }}>
      {children}
    </AuthContext.Provider>
  );
};
