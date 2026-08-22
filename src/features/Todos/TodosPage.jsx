import { useEffect, useState } from "react";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList/TodoList";

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState("");
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);

useEffect(() => {
  async function fetchTodos() {
    setIsTodoListLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: 100,
      });

      const response = await fetch(`/api/tasks?${params}`, {
        headers: {
          "X-CSRF-TOKEN": token,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error("Unable to fetch todos");
      }

      const data = await response.json();
      setTodoList(data.tasks);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsTodoListLoading(false);
    }
  }

  if (token) {
    fetchTodos();
  }
}, [token]);


async function addTodo(todoTitle) {
  const newTodo = {
    id: Date.now(),
    title: todoTitle,
    isCompleted: false,
  };

  // Optimistic update
  setTodoList((previous) => [newTodo, ...previous]);
setError("");

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token,
      },
      credentials: "include",
      body: JSON.stringify({
        title: newTodo.title,
        isCompleted: newTodo.isCompleted,
      }),
    });

    if (response.status === 401) {
  throw new Error("Unauthorized");
}

if (!response.ok) {
  throw new Error("Unable to add todo");
}

    const data = await response.json();

    setTodoList((previous) =>
      previous.map((todo) =>
        todo.id === newTodo.id ? data : todo
      )
    );
  } catch (error) {
    setTodoList((previous) =>
      previous.filter((todo) => todo.id !== newTodo.id)
    );

    setError(error.message);
  }
}

async function completeTodo(id) {
  const originalTodo = todoList.find((todo) => todo.id === id);

  const updatedTodoList = todoList.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        isCompleted: true,
      };
    }

    return todo;
  });

  // Optimistic update
  setTodoList(updatedTodoList);
  setError("");

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token,
      },
      credentials: "include",
      body: JSON.stringify({
        isCompleted: true,
      }),
    });

    if (response.status === 401) {
  throw new Error("Unauthorized");
}

if (!response.ok) {
  throw new Error("Unable to complete todo");
}

  } catch (error) {
    setTodoList((previous) =>
      previous.map((todo) =>
        todo.id === id ? originalTodo : todo
      )
    );

    setError(error.message);
  }
}

async function updateTodo(editedTodo) {
  const originalTodo = todoList.find(
    (todo) => todo.id === editedTodo.id
  );

  // Optimistic update
  setTodoList((previous) =>
    previous.map((todo) =>
      todo.id === editedTodo.id ? editedTodo : todo
    )
  );
  setError("");


  try {
    const response = await fetch(`/api/tasks/${editedTodo.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token,
      },
      credentials: "include",
      body: JSON.stringify({
        title: editedTodo.title,
        isCompleted: editedTodo.isCompleted,
      }),
    });

    if (response.status === 401) {
  throw new Error("Unauthorized");
}

if (!response.ok) {
  throw new Error("Unable to update todo");
}
  } catch (error) {
    setTodoList((previous) =>
      previous.map((todo) =>
        todo.id === editedTodo.id ? originalTodo : todo
      )
    );

    setError(error.message);
  }
}

return (
  <>
    {error && (
      <div>
        <p>{error}</p>
        <button onClick={() => setError("")}>Clear Error</button>
      </div>
    )}

    {isTodoListLoading && <p>Loading todos...</p>}

    <TodoForm onAddTodo={addTodo} />

    <TodoList
      todoList={todoList}
      onCompleteTodo={completeTodo}
      onUpdateTodo={updateTodo}
    />
  </>
);
}

export default TodosPage;