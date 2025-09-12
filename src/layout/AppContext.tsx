import React, { createContext, useContext, useState, type ReactNode } from "react";

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

  return (
    <AppContext.Provider
      value={{ auth, setAuth, otpData, setOtpData, user, setUser, theme, setTheme }}
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
