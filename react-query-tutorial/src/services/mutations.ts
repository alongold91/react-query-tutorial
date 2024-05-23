import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo } from '../types/todo';
import { createTodo, deleteTodo, updateTodo } from './api';

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Todo) => createTodo(data),
    /*All parameters are optional and can help us manipulate the state even further than the return data from the query,

        /*onMutate will run right before our mutationFn function */
    onMutate: (variables) => {
      console.log('I am in onMutate state');
    },
    /*We can intercept errors here and do something about them */
    onError: (error, variables, context) => {
      throw new Error('How dare you?!');
    },

    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      console.log('Yes!!');
    },
    // Error or success... doesn't matter!
    onSettled: (data, error, variables, context) => {
      console.log('Okay we are done');
    }
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Todo) => updateTodo(data),
    onSuccess: async (_, variables) => {
      /* variables is actually the data argument that gets passed to mutationFn this is how we can
      use it inside other scopes of the mutation  */
      await queryClient.invalidateQueries({
        queryKey: ['todo', { id: variables.id }]
      });
    }
  });
};

export const useUpdateTodoOptimistically = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Todo) => updateTodo(data),
    // Before mutationFn runs
    onMutate: async (editedTodo: Todo) => {
      // cancel any query runs if there are any in any component to avoid race condition
      await queryClient.cancelQueries({
        queryKey: ['todo', { id: editedTodo.id }]
      });
      /* Get the previous query data of the query key of ['todo', { id }]
         We will need this query to pass to onError method in case our query fails */
      const previousTodo = queryClient.getQueryData<Todo>([
        'todo',
        { id: editedTodo.id }
      ]);

      /* setQueryData is the method that helps us set the query cache state with the temporary value before
         the api function starts */

      queryClient.setQueryData(['todo', { id: editedTodo.id }], editedTodo);

      /*Returning previousTodo inside curly braces makes the context object populate it and makes
      it accesible inside it for the rest of the methods (onError, onSuccess, onSettled) */
      return { previousTodo };
    },
    onError: (err, editedTodo, context) => {
      /* Take the previousTodo we just populated inside onMutate and set the query cache 
      state value to it in case the query fails, by the way, the the value that gets passed
      to the query is avilable for us too, it is the second argument */
      if (context?.previousTodo) {
        queryClient.setQueryData(
          ['todo', { id: editedTodo.id }],
          context.previousTodo
        );
      }
    },
    /* If the query went successfully, we can invalidate the cache and populate the cache with the actual value from the database */
    onSuccess: async (_, editedTodo) => {
      await queryClient.invalidateQueries({
        queryKey: ['todo', { id: editedTodo.id }]
      });
    }
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
  });
};

export const useDeleteTodoOptimistically = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (deletedTodoId) => {
      await queryClient.cancelQueries({
        queryKey: ['todos']
      });
      const previousTodoIds = queryClient.getQueryData<number[]>(['todos']);
      queryClient.setQueryData(
        ['todos'],
        previousTodoIds?.filter((id) => id !== deletedTodoId)
      );
      return { previousTodoIds };
    },
    onError: (_, __, context) => {
      if (context?.previousTodoIds) {
        queryClient.setQueryData(['todos'], context.previousTodoIds);
      }
    },
    onSuccess: async () =>
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
  });
};
