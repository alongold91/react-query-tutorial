import { useQueries, useQuery } from '@tanstack/react-query';
import { getTodo, getTodosIds } from './api';

export const useTodosIds = () => {
  return useQuery({
    /* Inside this object we can pass many options and configurations,
        but the basic ones we need are the query key and query function*/
    queryKey: ['todos'],
    queryFn: getTodosIds // We could write the function from the first step in here directly but this is better organization
  });
};

export const useTodos = (ids: number[] | undefined) => {
  return useQueries({
    queries: (ids ?? []).map((id) => {
      return {
        queryKey: ['todo', { id }],
        queryFn: () => getTodo(id),
      };
    }),
  });
};
