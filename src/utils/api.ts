import axios from "axios";
import { useToastError } from "@/composables/useToastError";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  fetchOptions: {
    cache: "force-cache",
  }
});

let toastErrorHandler: ReturnType<typeof useToastError> | null = null;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!toastErrorHandler) {
      toastErrorHandler = useToastError();
    }

    toastErrorHandler(error);
    return Promise.reject(error);
  }
);

export default api;
