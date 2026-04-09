import { useQueryClient } from "@tanstack/react-query";
import {
  useListSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  getListSubjectsQueryKey,
} from "@workspace/api-client-react";

// Export standard query for consistency
export { useListSubjects };
export const useSubjects = useListSubjects;

export function useAddSubject() {
  const queryClient = useQueryClient();
  return useCreateSubject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });
      },
    },
  });
}

export function useEditSubject() {
  const queryClient = useQueryClient();
  return useUpdateSubject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });
      },
    },
  });
}

export function useRemoveSubject() {
  const queryClient = useQueryClient();
  return useDeleteSubject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });
      },
    },
  });
}
