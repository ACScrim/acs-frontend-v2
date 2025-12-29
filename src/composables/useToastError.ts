import { isAxiosError } from "axios";
import { useToastStore } from "@/stores/toastStore";
import { getErrorMessage } from "@/utils";
import type { ApiResponse } from "@/types/models";

type ErrorResponse = Pick<ApiResponse<unknown>, "error">;

export const useToastError = () => {
  const toastStore = useToastStore();

  return (error: unknown, fallbackMessage = "Une erreur est survenue.") => {
    const backendError = isAxiosError<ErrorResponse>(error)
      ? error.response?.data?.error
      : undefined;
    const message = backendError?.message || getErrorMessage(error) || fallbackMessage;

    toastStore.error(message, backendError?.code);
  };
};
