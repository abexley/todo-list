import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { isAuthenticated, logout } = useAuth();

  async function handleLogOut() {
    await logout();
  }

  return (
    <header>
      <h1>Todo List</h1>

      {isAuthenticated && (
        <button type="button" onClick={handleLogOut}>
          Log Out
        </button>
      )}
    </header>
  );
}

export default Header;