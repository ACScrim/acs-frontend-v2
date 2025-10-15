import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  fetchOptions: {
    cache: "force-cache",
  }
});

export default api;