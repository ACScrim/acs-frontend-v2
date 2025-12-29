import axios from "axios";
import { useToastError } from "@/composables/useToastError";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  fetchOptions: {
    cache: "force-cache",
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const toastError = useToastError();
    toastError(error);
    return Promise.reject(error);
  }
);

export default api;
