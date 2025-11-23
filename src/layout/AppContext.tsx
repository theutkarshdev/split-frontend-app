import { setLogoutHandler } from "@/lib/logoutHelper";
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";

// 1. Define types for different slices of state

type Theme = "dark" | "light" | "system";

interface AuthData {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  is_new: boolean;
}

interface OtpData {
  email: string | null;
  otp_id: string | null;
}

interface UserData {
  profile_pic: string | null;
  name: string;
  email: string;
}

// 2. Define the overall AppContext type
interface AppContextType {
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;

  otpData: OtpData;
  setOtpData: React.Dispatch<React.SetStateAction<OtpData>>;

  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  login: (token: string, refreshToken: string, is_new: boolean) => void;
  logout: () => void;
  markProfileComplete: () => void; // 👈 new method

  loading: boolean;
}

// 3. Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 4. Provider
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthData>({
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    is_new: false,
  });

  const [otpData, setOtpData] = useState<OtpData>({
    email: null,
    otp_id: null,
  });

  const [user, setUser] = useState<UserData>({
    profile_pic: "",
    name: "",
    email: "",
  });

  const [theme, _setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("app-theme") as Theme) || "system";
  });

  const [loading, setLoading] = useState(true);

  // 🔹 Apply theme to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = (theme: Theme) => {
    localStorage.setItem("app-theme", theme);
    _setTheme(theme);
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const parsedAuth: AuthData = JSON.parse(storedAuth);
      setAuth(parsedAuth);
    }
    setLoading(false);
  }, []);

  // 👉 Login method
  const login = (token: string, refreshToken: string, is_new: boolean) => {
    const authData = { token, refreshToken, isAuthenticated: true, is_new };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const logout = useCallback(() => {
    setAuth({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      is_new: false,
    });
    setOtpData({ email: null, otp_id: null });
    localStorage.removeItem("auth");
  }, []);

  // 👉 Mark profile complete (turn off is_new)
  const markProfileComplete = () => {
    setAuth((prev) => {
      const updated = { ...prev, is_new: false };
      localStorage.setItem("auth", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

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
        markProfileComplete, // 👈 expose new method
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
