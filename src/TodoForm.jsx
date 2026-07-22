function TodoForm() {
  return (
    <form>
      <label htmlFor="todoTitle">Todo title</label>
      <input id="todoTitle" type="text" />
      <button type="submit" disabled>
        Add Todo
      </button>
    </form>
  );
}
export default TodoForm;
