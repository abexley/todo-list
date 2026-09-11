/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const login = async (userEmail, password) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password,
        }),
        credentials: "include",
      };

      const response = await fetch("/api/users/logon", options);
      const data = await response.json();

      if (response.status === 200 && data.name && data.csrfToken) {
        setEmail(data.name);
        setToken(data.csrfToken);

        return {
          success: true,
        };
      }

      return {
        success: false,
        error: `Authentication failed: ${data?.message}`,
      };
    } catch {
      return {
        success: false,
        error: "Network error during login",
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch("/api/user/logoff", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": token,
          },
          credentials: "include",
        });
      }

      setEmail("");
      setToken("");

      return {
        success: true,
      };
    } catch {
      setEmail("");
      setToken("");

      return {
        success: false,
        error: "Error during logout",
      };
    }
  };

  const value = {
    email,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
