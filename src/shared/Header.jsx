import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "./Navigation";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut() {
    const result = await logout();

    if (result?.success !== false) {
      navigate("/login");
    }
  }

  return (
    <header>
      <h1>Todo List</h1>

      <Navigation />

      {isAuthenticated && (
        <button type="button" onClick={handleLogOut}>
          Log Out
        </button>
      )}
    </header>
  );
}

export default Header;