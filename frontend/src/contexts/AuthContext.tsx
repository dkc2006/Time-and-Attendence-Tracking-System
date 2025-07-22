import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const register = async (
    userData: Omit<User, "id"> & { password: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("❌ Registration failed:", data.message);
        return false;
      }

      const { token, user } = data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("❌ Error during registration:", error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("❌ Login failed:", data.message);
        return false;
      }

      const { token, user } = data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("❌ Error during login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
