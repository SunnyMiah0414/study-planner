import { useQueryClient } from "@tanstack/react-query";
import {
  useListSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  getListSessionsQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";

export { useListSessions };

export function useAddSession() {
  const queryClient = useQueryClient();
  return useCreateSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    },
  });
}

export function useEditSession() {
  const queryClient = useQueryClient();
  return useUpdateSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    },
  });
}

export function useRemoveSession() {
  const queryClient = useQueryClient();
  return useDeleteSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
    },
  });
}
