
import { useState } from "react";

import api from "../api"; // Import the api module

function Login({ onLogin, onShowRegister }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /*function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {setError("Please enter your email and password.");return;}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setError("Please enter a valid email address.");return;}
    // Demo login only. We will connect FastAPI later.
    onLogin(email);
    // Demo login only. We will connect FastAPI later.
  }*/


async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (!email.trim() || !password) {setError("Please enter your email and password.");return; }
  try {
    const response = await api.post("/auth/login", {email, password, } );

    // Store the token only if the backend returns it.
    const token = response.data.access_token;
    if (token) {localStorage.setItem("access_token", token);}

    onLogin(email);

  } catch (error) {
    const message = error.response?.data?.detail || "Login failed. Check your backend and credentials.";
    setError( typeof message === "string"? message : "Login failed. Please try again." );
  }
}







  return (
    <div className="auth-container">

      <form className="auth-card" onSubmit={handleSubmit}>

        <h1>Welcome Back</h1>
        <p>Sign in to your Code Generation Agent</p>

        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />

        <label htmlFor="login-password">Password</label>
        <input id="login-password"type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />

        {error && <p className="error-message">{error}</p>}

        <button type="submit">Login</button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button type="button" className="text-button" onClick={onShowRegister}>Register</button>
        </p>
      </form>

    </div>
  );
}

export default Login;
