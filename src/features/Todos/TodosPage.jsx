import { useCallback, useEffect, useState } from "react";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList/TodoList";
import SortBy from "../../shared/SortBy";
import FilterInput from "../../shared/FilterInput";
import useDebounce from "../../utils/useDebounce";

function TodosPage({ token }) {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState("");
  const [isTodoListLoading, setIsTodoListLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterTerm, setFilterTerm] = useState("");
  const debouncedFilterTerm = useDebounce(filterTerm, 300);
  const [dataVersion, setDataVersion] = useState(0);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    async function fetchTodos() {
      setIsTodoListLoading(true);
      setError("");

      try {
        const paramsObject = {
          sortBy,
          sortDirection,
          limit: 100,
        };

        if (debouncedFilterTerm) {
          paramsObject.find = debouncedFilterTerm;
        }

        const params = new URLSearchParams(paramsObject);

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
        setFilterError("");
      } catch (error) {
        if (
          debouncedFilterTerm ||
          sortBy !== "createdAt" ||
          sortDirection !== "desc"
        ) {
          setFilterError(`Error filtering/sorting todos: ${error.message}`);
        } else {
          setError(`Error fetching todos: ${error.message}`);
        }
      } finally {
        setIsTodoListLoading(false);
      }
    }

    if (token) {
      fetchTodos();
    }
  }, [token, sortBy, sortDirection, debouncedFilterTerm]);

  const invalidateCache = useCallback(() => {
    setDataVersion((prev) => prev + 1);
  }, []);

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
        previous.map((todo) => (todo.id === newTodo.id ? data : todo)),
      );

      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.filter((todo) => todo.id !== newTodo.id),
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
      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) => (todo.id === id ? originalTodo : todo)),
      );

      setError(error.message);
    }
  }

  async function updateTodo(editedTodo) {
    const originalTodo = todoList.find((todo) => todo.id === editedTodo.id);

    // Optimistic update
    setTodoList((previous) =>
      previous.map((todo) => (todo.id === editedTodo.id ? editedTodo : todo)),
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

      invalidateCache();
    } catch (error) {
      setTodoList((previous) =>
        previous.map((todo) =>
          todo.id === editedTodo.id ? originalTodo : todo,
        ),
      );

      setError(error.message);
    }
  }

  const handleFilterChange = (newTerm) => {
    setFilterTerm(newTerm);
  };

  return (
    <>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => setError("")}>Clear Error</button>
        </div>
      )}

      {filterError && (
        <div>
          <p>{filterError}</p>

          <button onClick={() => setFilterError("")}>Clear Filter Error</button>

          <button
            onClick={() => {
              setFilterTerm("");
              setSortBy("createdAt");
              setSortDirection("desc");
              setFilterError("");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {isTodoListLoading && <p>Loading todos...</p>}

      <SortBy
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
      />

      <FilterInput
        filterTerm={filterTerm}
        onFilterChange={handleFilterChange}
      />

      <TodoForm onAddTodo={addTodo} />

      <TodoList
        todoList={todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
        dataVersion={dataVersion}
      />
    </>
  );
}

export default TodosPage;
