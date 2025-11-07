import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import axios from "axios";
import { useAppContext } from "@/hooks/useAppContext";
import toast from "react-hot-toast";

interface GoogleLoginButtonProps {
  setLoading: (state: boolean) => void;
}

const GoogleLoginButton = ({ setLoading }: GoogleLoginButtonProps) => {
  const { login } = useAppContext();

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
        { id_token },
        { withCredentials: true }
      );

      const data = res.data;

      // ✅ Update context and user state
      login(data.access_token, data.is_new);

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
    <div className="flex justify-center mt-2">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleLoginButton;
