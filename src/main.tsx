import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AppContextProvider } from "./layout/AppContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppContextProvider>
        <App />
        <Toaster />
      </AppContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
