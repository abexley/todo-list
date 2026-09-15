import { NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="main-nav">
      <ul>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <NavLink to="/todos">Todos</NavLink>
            </li>

            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;