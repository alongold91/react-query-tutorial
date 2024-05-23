import { SubmitHandler, useForm } from 'react-hook-form';
import { useCreateTodo } from '../services/mutations';
import { Todo } from '../types/todo';

const CreateNewTodo = () => {

   const createTodoMutation = useCreateTodo();

   const handleCreateTodoSubmit: SubmitHandler<Todo> = (data) => {
      const newData: Todo = {
         ...data,
         checked: false
      }
      /*createTodo.mutate calls mutationFn that we defined inside of useMutation */
      createTodoMutation.mutate(newData)
   }

   const { register, handleSubmit } = useForm<Todo>();

   return (
      <form onSubmit={handleSubmit(handleCreateTodoSubmit)}>
         <h4>New todo</h4>
         <input type='text' placeholder='Title' {...register('title')} />
         <br />
         <input type='text' placeholder='Description' {...register('description')} />
         <br />
         <input type='submit' placeholder='Description' disabled={createTodoMutation.isPending} />
      </form>
   )
}

export default CreateNewTodo