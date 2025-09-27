import { setLogoutHandler } from "@/lib/logoutHelper";
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";

// 1. Define types for different slices of state
interface AuthData {
  token: string | null;
  isAuthenticated: boolean;
  is_new: boolean;
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

  login: (token: string, is_new: boolean) => void;
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
    isAuthenticated: false,
    is_new: false,
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

    setLoading(false);
  }, []);

  // 👉 Login method
  const login = (token: string, is_new: boolean) => {
    const authData = { token, isAuthenticated: true, is_new };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const logout = useCallback(() => {
    setAuth({ token: null, isAuthenticated: false, is_new: false });
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
        markProfileComplete, // 👈 expose new method
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext