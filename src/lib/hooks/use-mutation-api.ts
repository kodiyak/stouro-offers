import {
  type DefaultError,
  type QueryClient,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { useRef } from "react";
import { type ToastT, toast } from "sonner";

type ToastCallback<TData, TError, TVariables> = (params: {
  data?: TData;
  error?: TError;
  variables?: TVariables;
}) => Omit<ToastT, "id"> | null;

export function useMutationAPI<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    toast?: {
      success?: ToastCallback<TData, TError, TVariables>;
      error?: ToastCallback<TData, TError, TVariables>;
      loading?: ToastCallback<TData, TError, TVariables>;
    };
  },
  queryClient?: QueryClient,
) {
  const toastRef = useRef<string | number | null>(null);

  const mutation = useMutation(
    {
      ...options,
      onMutate: async (variables, context) => {
        if (options.toast?.loading) {
          const toastConfig = options.toast.loading({ variables });
          if (toastConfig) {
            toastRef.current = toast.loading(toastConfig.title, {
              description: toastConfig.description,
              ...toastConfig,
            });
          }
        }

        return options?.onMutate?.(variables, context);
      },
      onSuccess: async (data, variables, result, context) => {
        if (toastRef.current) {
          if (options.toast?.success) {
            const toastConfig = options.toast.success({ data, variables });
            if (toastConfig) {
              toast.success(toastConfig.title, {
                id: toastRef.current,
                description: toastConfig.description,
                ...toastConfig,
              });
            } else {
              toast.dismiss(toastRef.current);
            }
          } else {
            toast.dismiss(toastRef.current);
          }
        }

        return options?.onSuccess?.(data, variables, result!, context);
      },
      onError: async (error, variables, result, context) => {
        if (toastRef.current) {
          if (options.toast?.error) {
            const toastConfig = options.toast.error({ error, variables });
            if (toastConfig) {
              toast.error(toastConfig.title, {
                id: toastRef.current,
                description: toastConfig.description,
                ...toastConfig,
              });
            } else {
              toast.dismiss(toastRef.current);
            }
          } else {
            toast.dismiss(toastRef.current);
          }
        }

        return options?.onError?.(error, variables, result, context);
      },
      onSettled: async (data, error, variables, result, context) => {
        // Ensure toast is dismissed if not handled by success/error
        if (
          toastRef.current &&
          !options.toast?.success &&
          !options.toast?.error
        ) {
          toast.dismiss(toastRef.current);
        }

        return options?.onSettled?.(data, error, variables, result, context);
      },
    },
    queryClient,
  );

  return mutation;
}
