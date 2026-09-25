import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useAppContext } from "@/hooks/useAppContext";
import toast from "react-hot-toast";
import { useState } from "react";

interface GoogleLoginButtonProps {
  setLoading: (state: boolean) => void;
}

const GoogleLoginButton = ({ setLoading }: GoogleLoginButtonProps) => {
  const { login } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const id_token = credentialResponse?.credential;
    if (!id_token) {
      toast.error("Google login failed. No credentials received.");
      return;
    }

    setLoading(true);
    toast.loading("Signing in with Google...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/google/token`,
        { id_token }
      );

      const data = res.data;

      // Update context and user state
      login(data.access_token, data.refresh_token, data.is_new);

      toast.dismiss();
      toast.success("Google login successful!");
    } catch (error: any) {
      console.error("Google login failed:", error);
      toast.dismiss();

      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error("Google login was cancelled or failed.");
  };

  return (
    <div className="relative w-full h-13 sm:h-14 rounded-2xl overflow-hidden group shadow-xs">
      {/* Visual Custom Button — Styled identically to the primary Continue with OTP button */}
      <div
        className={`w-full h-full rounded-2xl border border-border/80 dark:border-white/[0.12] bg-card text-foreground font-bold text-base flex items-center justify-center gap-3 transition-all duration-150 select-none shadow-xs group-hover:shadow-md group-hover:bg-muted/70 group-hover:border-foreground/30 ${
          isHovered ? "bg-muted/70 border-foreground/30 shadow-md" : ""
        } group-active:scale-[0.98] cursor-pointer`}
      >
        <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.27 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span className="tracking-tight text-foreground">Continue with Google</span>
      </div>

      {/* Functional Google Sign-In trigger */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute inset-0 z-10 w-full h-full opacity-[0.001] flex items-center justify-center cursor-pointer pointer-events-auto overflow-hidden"
        title="Sign in with Google"
      >
        <div className="w-[420px] h-full flex items-center justify-center scale-[1.35] transform cursor-pointer">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            width="400"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
