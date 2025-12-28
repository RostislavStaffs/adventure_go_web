import React, { useState } from "react";
import "./AdminLogin.css";
import planeImg from "./images/plane.jpg";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !adminId.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Admin login failed");
        return;
      }

      // store token exactly like normal login (this is what actually matters)
      localStorage.setItem("token", data.token);

      // optional convenience flags
      localStorage.setItem("isAdmin", "true");

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="adminLogin-page">
      <div className="adminLogin-shell">
        <header className="adminLogin-topbar">
          <div className="adminLogin-topbar-inner">
            <div className="adminLogin-brand">
              Adventure <span>GO</span>
            </div>

            <Link to="/" className="adminLogin-back">
              <span className="adminLogin-back-icon">←</span>
              Back
            </Link>
          </div>
        </header>

        <main className="adminLogin-main">
          <section className="adminLogin-grid">
            <div className="adminLogin-imageCard">
              <img className="adminLogin-image" src={planeImg} alt="" />

              <div className="adminLogin-imageOverlay">
                <h3>Continue helping customers</h3>
                <p>
                  Sign in and continue your journey of making <br />
                  customers happy.
                </p>
              </div>
            </div>

            <div className="adminLogin-formCard">
              <h1>Sign in</h1>

              <p className="adminLogin-subtitle">
                Welcome back to Adventure GO{" "}
                <span className="adminLogin-wave" aria-hidden="true">
                  👋🏻
                </span>
                <br />
                Sign in into your admin account.
              </p>

              {error && <p className="adminLogin-error">{error}</p>}

              <form className="adminLogin-form" onSubmit={handleAdminLogin}>
                <label className="adminLogin-label" htmlFor="adminEmail">
                  Email
                </label>

                <div className="adminLogin-inputWrap">
                  <span className="adminLogin-inputIcon" aria-hidden="true">
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
                    id="adminEmail"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <label className="adminLogin-label" htmlFor="adminPassword">
                  Password
                </label>

                <div className="adminLogin-inputWrap">
                  <span className="adminLogin-inputIcon" aria-hidden="true">
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
                    id="adminPassword"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <label className="adminLogin-label" htmlFor="adminId">
                  Admin id
                </label>

                <div className="adminLogin-inputWrap">
                  <span className="adminLogin-inputIcon" aria-hidden="true">
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
                    id="adminId"
                    type="password"
                    placeholder="Admin id"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                  />
                </div>

                <button className="adminLogin-submit" type="submit">
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
