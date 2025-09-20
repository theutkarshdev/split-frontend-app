import { toast } from "react-hot-toast";
import successSound from "@/assets/success.mp3"; // adjust path if needed
import errorSound from "@/assets/error.mp3";

// Preload audio
const successAudio = new Audio(successSound);
const errorAudio = new Audio(errorSound);

// Save original methods
const originalSuccess = toast.success;
const originalError = toast.error;

// Use the same type signature as the original toast.success
toast.success = ((message, options) => {
  successAudio.currentTime = 0;
  successAudio.play().catch(() => {
    console.warn("Success sound blocked until user interacts with page");
  });
  return originalSuccess(message, options);
}) as typeof toast.success;

toast.error = ((message, options) => {
  errorAudio.currentTime = 0;
  errorAudio.play().catch(() => {
    console.warn("Error sound blocked until user interacts with page");
  });
  return originalError(message, options);
}) as typeof toast.error;