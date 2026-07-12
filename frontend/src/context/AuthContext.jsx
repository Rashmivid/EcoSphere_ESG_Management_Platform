import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ecosphere_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login-json", { email, password });
    localStorage.setItem("ecosphere_token", res.data.access_token);
    localStorage.setItem("ecosphere_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("ecosphere_token", res.data.access_token);
    localStorage.setItem("ecosphere_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("ecosphere_token");
    localStorage.removeItem("ecosphere_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
