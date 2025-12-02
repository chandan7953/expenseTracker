import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    setLoading(true);
    try {
      const authRes = await api.get(`/check-auth`);
      setUser(authRes.data.user);
      setUserId(authRes.data.user.id);
      setIsPro(authRes.data.isPro);
    } catch (err) {
      setUser(null);
      setUserId(null);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const refreshAuth = () => fetchAuth();

  return (
    <AuthContext.Provider value={{ user, userId, isPro, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
