import { isAxiosError } from "axios";
import { useToastStore } from "@/stores/toastStore";
import { getErrorMessage } from "@/utils";
import type { ApiResponse } from "@/types/models";

type ApiErrorResponse = Pick<ApiResponse<unknown>, "error">;

export const toastApiError = (error: unknown, fallbackMessage = "An unexpected error occurred.") => {
  try {
    const toastStore = useToastStore();
    const backendError = isAxiosError<ApiErrorResponse>(error)
      ? error.response?.data?.error
      : undefined;
    const message = backendError?.message || getErrorMessage(error) || fallbackMessage;

    toastStore.error(message, backendError?.code);
  } catch {
    console.warn("Unable to display error toast", error);
  }
};

export const useToastError = () => ({ toastApiError });
