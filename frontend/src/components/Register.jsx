
import { useState } from "react";
import api from "../api"; // Import the api module

function Register({ onRegister, onShowLogin }) {

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {setError("Please fill in all fields.");return;}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setError("Please enter a valid email address.");return;}
    if (password.length < 8) {setError("Password must contain at least 8 characters.");return;}

    try { await api.post("/auth/register", {username,email,password,});
    // Registration succeeded. Return to login.
    onShowLogin();
    } catch (error) { const message = error.response?.data?.detail || "Registration failed. Please try again.";

        setError(typeof message === "string"? message: "Registration failed. Please try again.");
    }
    onRegister(username, email);

  }

  return (
    <div className="auth-container">

      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Register for your Code Generation Agent</p>

        <label htmlFor="register-name">Full Name</label>
        <input id="register-name" value={username} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" />

        <label htmlFor="register-email">Email</label>
        <input id="register-email" type="email" value={email}onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"/>

        <label htmlFor="register-password">Password</label>
        <input id="register-password"type="password"value={password}onChange={(e) => setPassword(e.target.value)}placeholder="At least 8 characters"/>

        {error && <p className="error-message">{error}</p>}

        <button type="submit">Register</button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button"className="text-button"onClick={onShowLogin}>Login</button>
        </p>
      </form>
    </div>
  );
}

export default Register;
