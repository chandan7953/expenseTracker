import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAuth = async () => {
    setLoading(true);
    try {
      const authRes = await axios.get("http://localhost:3000/api/check-auth", {
        withCredentials: true,
      });

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

  const refreshAuth = () => fetchAuth();

  useEffect(() => {
    fetchAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userId, isPro, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
