import TodosPage from "./features/Todos/TodosPage";
import Logon from "./features/Logon";
import Header from "./shared/Header";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header />

      {isAuthenticated ? <TodosPage /> : <Logon />}
    </>
  );
}

export default App;