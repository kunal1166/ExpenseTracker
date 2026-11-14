
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("expense_tracker_token")
  );

  const [loading, setLoading] = useState(true);

  // Restore logged-in user when the app starts
  useEffect(() => {
    const restoreUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        localStorage.removeItem("expense_tracker_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, [token]);

  // Login
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token: newToken, user: loggedInUser } = response.data;

    localStorage.setItem("expense_tracker_token", newToken);
    setToken(newToken);
    setUser(loggedInUser);
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    const { token: newToken, user: registeredUser } = response.data;

    localStorage.setItem("expense_tracker_token", newToken);
    setToken(newToken);
    setUser(registeredUser);
  };

  // Update Profile
  const updateProfile = async (name: string) => {
    const response = await api.put("/auth/me", {
      name: name.trim(),
    });

    setUser(response.data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("expense_tracker_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
