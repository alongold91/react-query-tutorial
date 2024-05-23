import { ChangeEvent, useEffect, useState } from 'react';
import { useTodos, useTodosIds } from '../services/queries';
import { useDeleteTodo, useDeleteTodoOptimistically, useUpdateTodo, useUpdateTodoOptimistically } from '../services/mutations';
import { Todo } from '../types/todo';
import { SubmitHandler, useForm } from 'react-hook-form';

const Todos = () => {
  const todoIdsQuery = useTodosIds();
  const getTodosQuery = useTodos(todoIdsQuery.data);
  const updateTodoMutation = useUpdateTodo();
  const optimisticallyUpdateTodoMutation = useUpdateTodoOptimistically();
  const deleteTodoMutation = useDeleteTodo();
  const deleteTodoMutationOptimistically = useDeleteTodoOptimistically();

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    //If the toggleCheck mutation is done working we can make it appear on the screen again
    if (!updateTodoMutation.isPending && !optimisticallyUpdateTodoMutation.isPending) {
      setUpdatingId(null);
    }
  }, [updateTodoMutation.isPending, optimisticallyUpdateTodoMutation.isPending])


  const toggleTodoChecked = (data: Todo, isChecked: boolean) => {
    setUpdatingId(data.id);
    updateTodoMutation.mutate({
      ...data,
      checked: isChecked
    })
  }

  const handleTodoUpdate: SubmitHandler<Todo> = (formData) => {
    setUpdatingId(formData.id);
    optimisticallyUpdateTodoMutation.mutate(
      formData
    );
  }

  const handleDeleteTodo = (id: number) => deleteTodoMutationOptimistically.mutate(id);

  return (
    <ul>
      {getTodosQuery.map(({ data, isError, isPending }) => (
        isPending ? <p>Loading...</p> :
          isError ? <p>error...</p> :
            <div style={{ display: 'flex', gap: '50px', }}>
              <li key={data.id}>
                <div>Id: {data.id}</div>
                <div>Title: {data.title}</div>
                <div>Description: {data.description}</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {
                    updatingId === data.id ? <span>Updating...</span> :
                      <input
                        type="checkbox" checked={data.checked}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => toggleTodoChecked(data, e.target.checked)} />
                  }
                  <p>is checked? {data.checked + ''}</p>
                </div>
                <button onClick={() => handleDeleteTodo(data.id)}>Delete todo</button>
              </li>
              <TodoForm key={`todo-form-${data.id}`} todo={data} onSubmit={handleTodoUpdate} isPending={updatingId === data.id} />
            </div>
      ))}
    </ul>
  )
}

export default Todos

type TodoFormProps = {
  todo: Todo;
  onSubmit: SubmitHandler<Todo>;
  isPending: boolean;
};

const TodoForm = ({ todo, onSubmit, isPending }: TodoFormProps) => {

  const { register, handleSubmit, setValue } = useForm<Todo>({
    defaultValues: {
      title: todo.title,
      description: todo.description,
      id: todo.id,
      checked: todo.checked
    },
  });

  useEffect(() => {
    setValue('checked', todo.checked)
  }, [todo.checked])
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 style={{margin: 0}}>Edit todo</h4>
      <input type="text" placeholder="Title" {...register('title')} />
      <br />
      <input type="text" placeholder="Description" {...register('description')} />
      <br />
      <button type="submit" disabled={isPending}>
        edit todo
      </button>
    </form>
  );
};