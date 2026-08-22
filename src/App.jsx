import { useState } from "react";
import TodosPage from "./features/todos/TodosPage";
import Logon from "./features/Logon";
import Header from "./shared/Header";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  return (
    <>
      <Header
        token={token}
        onSetToken={setToken}
        onSetEmail={setEmail}
      />

      {token ? (
        <TodosPage token={token} />
      ) : (
        <Logon
          onSetEmail={setEmail}
          onSetToken={setToken}
        />
      )}
    </>
  );
}

export default App;