import { useState } from "react";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import "./App.css";

function App() {
  const [todoList, setTodoList] = useState([]);

  function addTodo(todoTitle) {
    const newTodo = {
      id: Date.now(),
      title: todoTitle,
      isCompleted: false,
    };
    setTodoList((previous) => [newTodo, ...previous]);
  }
 function completeTodo(id) {
  const updatedTodoList = todoList.map((todo) => {
    if ( todo.id === id) {
      return {
        ...todo,
        isCompleted: true,
      };
    }

    return todo;
  });

  setTodoList(updatedTodoList);
 }

  return (
    <>
      <h1>Todo List</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList 
        todoList={todoList} 
        onCompleteTodo={completeTodo}
      />
    </>
  );
}

export default App;
