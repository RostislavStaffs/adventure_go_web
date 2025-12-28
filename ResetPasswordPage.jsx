import React, { useState } from "react";
import "./ResetPasswordPage.css";
import planeImg from "./images/plane.jpg";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirm) {
      setError("All fields are required");
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
      }, 2000);
    } catch {
      setError("Server not reachable");
      setLoading(false);
    }
  }

  return (
    <div className="resetPage">
      <div className="resetShell">
        <header className="resetTopbar">
          <div className="resetTopbarInner">
            <div className="resetBrand">
              Adventure <span>GO</span>
            </div>
          </div>
        </header>

        <main className="resetMain">
          <section className="resetGrid">
            <div className="resetImageCard">
              <img src={planeImg} alt="" className="resetImage" />
              <div className="resetImageOverlay">
                <h3>Happy to help our customers</h3>
                <p>
                  If there are any other concerns please contact our support team
                  and we will get back to you.
                </p>
              </div>
            </div>

            <div className="resetFormCard">
              <h1>Reset Password</h1>
              <p className="resetSubtitle">
                Enter your new password and you are good to go
              </p>

              {error && <div className="resetError">{error}</div>}
              {success && <div className="resetSuccess">{success}</div>}

              <form className="resetForm" onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label>New password</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label>Re-enter new password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Sign in"}
                </button>
              </form>

              <Link to="/login" className="resetBack">
                Back to login
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
