import React, { useState } from "react";
import "./login.css";
import planeImg from "./images/plane.jpg";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const handleLogin = async (e) => {
    
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // save token
    localStorage.setItem("token", data.token);

    // go to main page
    window.location.href = "/main";
  } catch (err) {
    setError("Server not reachable");
  }
};

  return (
    
    <div className="login-page">
      <div className="login-shell">
        <header className="login-topbar">
          <div className="login-topbar-inner">
            <div className="login-brand">
              Adventure <span>GO</span>
            </div>

            <Link to="/" className="login-back">
              <span className="login-back-icon">←</span>
              Back
            </Link>
          </div>
        </header>

        <main className="login-main">
          <section className="login-grid">
            <div className="login-imageCard">
              <img className="login-image" src={planeImg} alt="" />

              <div className="login-imageOverlay">
                <h3>Continue your journey</h3>
                <p>
                  Sign in and capture every unforgettable <br />
                  journey with one click.
                </p>
              </div>
            </div>

            <div className="login-formCard">
              <h1>Sign in</h1>

              <p className="login-subtitle">
                Welcome back to Adventure GO{" "}
                <span className="login-wave" aria-hidden="true">
                  👋🏻
                </span>
                <br />
                Sign in into your account.
              </p>
              {error && <p className="login-error">{error}</p>}

              <form className="login-form" onSubmit={handleLogin}>
                <label className="login-label" htmlFor="email">
                  Email
                </label>
                <div className="login-inputWrap">
                  <span className="login-inputIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M4.5 7.5l7.1 4.7c.25.17.55.25.9.25s.65-.08.9-.25l7.1-4.7"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.2 18h11.6c1 0 1.7-.8 1.7-1.7V7.7c0-1-.8-1.7-1.7-1.7H6.2c-1 0-1.7.8-1.7 1.7v8.6c0 1 .8 1.7 1.7 1.7z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                 <input
                 type="email"
                placeholder="Email"
                value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>

                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <div className="login-inputWrap">
                  <span className="login-inputIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M7.5 11V8.9c0-2.6 1.9-4.7 4.5-4.7s4.5 2.1 4.5 4.7V11"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.2 19.5h9.6c1 0 1.7-.8 1.7-1.7v-5.1c0-1-.8-1.7-1.7-1.7H7.2c-1 0-1.7.8-1.7 1.7v5.1c0 1 .8 1.7 1.7 1.7z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />

                </div>

                <div className="login-createRow">
                  <span>Don’t have an account?</span>
                  <Link to="/signup">Create an account</Link>
                </div>

                <div className="login-optionsRow">
                  <label className="login-remember">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>

                  <Link to="/contact" className="login-forgot">
                    Forgotten password?
                  </Link>

                </div>

                <button className="login-submit" type="submit">
                Sign in
                </button>

              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
