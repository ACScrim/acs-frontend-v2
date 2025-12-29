import type { AxiosError } from "axios";
import { useToastStore } from "@/stores/toastStore";
import { getErrorMessage } from "@/utils";
import type { ApiResponse } from "@/types/models";

type ErrorResponse = Pick<ApiResponse<unknown>, "error">;

export const useToastError = () => {
  const toastStore = useToastStore();

  return (error: unknown, fallbackMessage = "Une erreur est survenue.") => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const backendError = axiosError.response?.data?.error;
    const message = backendError?.message || getErrorMessage(error) || fallbackMessage;

    toastStore.error(message, backendError?.code);
  };
};
