import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AppContextProvider } from "./layout/AppContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppContextProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </AppContextProvider>
  </StrictMode>
);
