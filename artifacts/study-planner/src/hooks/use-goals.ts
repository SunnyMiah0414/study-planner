import { useQueryClient } from "@tanstack/react-query";
import {
  useListGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  getListGoalsQueryKey,
} from "@workspace/api-client-react";

export { useListGoals };

export function useAddGoal() {
  const queryClient = useQueryClient();
  return useCreateGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      },
    },
  });
}

export function useEditGoal() {
  const queryClient = useQueryClient();
  return useUpdateGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      },
    },
  });
}

export function useRemoveGoal() {
  const queryClient = useQueryClient();
  return useDeleteGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      },
    },
  });
}
