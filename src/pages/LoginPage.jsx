import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoggingOn, setIsLoggingOn] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/todos";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  async function handleSubmit(event) {
    event.preventDefault();

    setAuthError("");
    setValidationError("");

    if (!email.trim() || !password.trim()) {
      setValidationError("Please enter both your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setIsLoggingOn(true);

    const result = await login(email.trim(), password);

    if (!result.success) {
      setAuthError(result.error);
    }

    setIsLoggingOn(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {validationError && (
        <p className="error-message" role="alert">
          {validationError}
        </p>
      )}

      {authError && (
        <p className="error-message" role="alert">
          {authError}
        </p>
      )}

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        maxLength={100}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        maxLength={100}
        required
      />

      <button type="submit" disabled={isLoggingOn}>
        {isLoggingOn ? "Logging in..." : "Log On"}
      </button>
    </form>
  );
}

export default LoginPage;