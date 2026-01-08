import React, { useEffect, useMemo, useState } from "react";
import "./ResetPasswordPage.css";
import planeImg from "./images/plane.jpg";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:4000";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const initialToken = useMemo(() => params.get("token") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep in sync if user opens a different reset link while staying on page
    setEmail(initialEmail);
    setToken(initialToken);
  }, [initialEmail, initialToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirm) {
      setError("All fields are required");
      return;
    }

    if (!token) {
      setError("Reset token missing. Please use the reset link again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Password reset failed");
        setLoading(false);
        return;
      }

      setSuccess("Password reset successful. You can now sign in.");
      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      setError("Server not reachable");
      setLoading(false);
    }
  }

  return (
    <div className="reset-page">
      <div className="reset-shell">
        <header className="reset-topbar">
          <div className="reset-topbar-inner">
            <div className="reset-brand">
              Adventure <span>GO</span>
            </div>

            <Link to="/login" className="reset-back">
              <span className="reset-back-icon">←</span>
              Back
            </Link>
          </div>
        </header>

        <main className="reset-main">
          <section className="reset-grid">
            <div className="reset-imageCard">
              <img className="reset-image" src={planeImg} alt="" />

              <div className="reset-imageOverlay">
                <h3>Happy to help our customers</h3>
                <p>
                  If there are any other concerns please contact our support team
                  and we will get back to you.
                </p>
              </div>
            </div>

            <div className="reset-formCard">
              <h1>Reset Password</h1>

              <p className="reset-subtitle">
                Enter your new password and you are good to go!
              </p>

              {error && <p className="reset-error">{error}</p>}
              {success && <p className="reset-success">{success}</p>}

              <form className="reset-form" onSubmit={handleSubmit}>
                <label className="reset-label" htmlFor="resetEmail">
                  Email
                </label>

                <div className="reset-inputWrap">
                  <span className="reset-inputIcon" aria-hidden="true">
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
                    id="resetEmail"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <label className="reset-label" htmlFor="resetPassword">
                  New password
                </label>

                <div className="reset-inputWrap">
                  <span className="reset-inputIcon" aria-hidden="true">
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
                    id="resetPassword"
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <label className="reset-label" htmlFor="resetConfirm">
                  Re-enter new password
                </label>

                <div className="reset-inputWrap">
                  <span className="reset-inputIcon" aria-hidden="true">
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
                    id="resetConfirm"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <button className="reset-submit" type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Sign in"}
                </button>
              </form>

              <Link to="/login" className="reset-backToLogin">
                Back to login
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
