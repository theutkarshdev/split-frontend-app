import { setLogoutHandler } from "@/lib/logoutHelper";
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// 1. Define types for different slices of state
interface AuthData {
  token: string | null;
  isAuthenticated: boolean;
}

interface OtpData {
  email: string | null;
  otp_id: string | null;
}

interface UserData {
  id: string | null;
  name: string;
  email: string;
}

type ThemeMode = "light" | "dark";

// 2. Define the overall AppContext type
interface AppContextType {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;

  otpData: OtpData;
  setOtpData: React.Dispatch<React.SetStateAction<OtpData>>;

  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;

  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;

  login: (token: string) => void;
  logout: () => void;

  loading: boolean;
}

// 3. Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 4. Provider
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthData>({
    token: null,
    isAuthenticated: false,
  });

  const [otpData, setOtpData] = useState<OtpData>({
    email: null,
    otp_id: null,
  });

  const [user, setUser] = useState<UserData>({
    id: null,
    name: "",
    email: "",
  });

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [loading, setLoading] = useState(true);

  // 👉 Load from localStorage on first render
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    const storedTheme = localStorage.getItem("theme");

    if (storedAuth) {
      const parsedAuth: AuthData = JSON.parse(storedAuth);
      setAuth(parsedAuth);
    }

    if (storedTheme) {
      setTheme(storedTheme as ThemeMode);
    }

    setLoading(false)
  }, []);

  // 👉 Login method
  const login = (token: string) => {
    const authData = { token, isAuthenticated: true };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  // 👉 Logout method
  const logout = () => {
    setAuth({ token: null, isAuthenticated: false });
    setOtpData({ email: null, otp_id: null });
    localStorage.removeItem("auth");
  };

    useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  // 👉 Persist theme change
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        auth,
        setAuth,
        otpData,
        setOtpData,
        user,
        setUser,
        theme,
        setTheme,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 5. Custom hook for easy access
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
