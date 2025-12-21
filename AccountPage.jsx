import React, { useEffect, useMemo, useState } from "react";
import "./account.css";
import { Link } from "react-router-dom";

export default function AccountPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [saved, setSaved] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load user on page load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load account details.");
          setLoading(false);
          return;
        }

        setForm(data.user);
        setSaved(data.user);
        setLoading(false);
      } catch (err) {
        setError("Server not reachable");
        setLoading(false);
      }
    })();
  }, []);

  const fullName = useMemo(() => {
    const fn = (form.firstName || "").trim();
    const ln = (form.lastName || "").trim();
    const name = `${fn} ${ln}`.trim();
    return name || "User";
  }, [form.firstName, form.lastName]);

  const isDirty =
    form.firstName !== saved.firstName ||
    form.lastName !== saved.lastName ||
    form.email !== saved.email ||
    form.phone !== saved.phone;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onClickConfirmChanges() {
    setError("");
    if (!isDirty) return;
    setShowConfirm(true);
  }

  async function confirmYes() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setError("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save changes.");
        setShowConfirm(false);
        return;
      }

      setSaved(data.user);
      setForm(data.user);
      setShowConfirm(false);
    } catch (err) {
      setError("Server not reachable");
      setShowConfirm(false);
    }
  }

  function confirmNo() {
    setForm(saved);
    setShowConfirm(false);
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-shell">
          <p style={{ padding: 24 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-shell">
        {/* Top bar */}
        <header className="account-topbar">
          <div className="account-topbar-inner">
            <div className="account-brand">
              Adventure <span>GO</span>
            </div>

            <Link to="/main" className="account-back">
              <span className="account-back-icon">←</span>
              Back
            </Link>
          </div>
        </header>

        {/* Main Card */}
        <main className="account-main">
          <section className="account-card">
            <h1>My account</h1>

            {error && <p className="account-error">{error}</p>}

            {/* Profile card (matches CSS) */}
            <div className="account-profileCard">
              <div className="account-avatar" aria-hidden="true" />

              <div className="account-profileText">
                <div className="account-name">{fullName}</div>
                <div className="account-role">User</div>
              </div>

              <button className="account-uploadBtn" type="button">
                Upload
              </button>
            </div>

            {/* Two column fields */}
            <div className="account-grid">
              <div className="account-field">
                <label>First name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="account-field">
                <label>Last name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>

              <div className="account-field">
                <label>Email Address</label>
                <input
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div className="account-field">
                <label>Phone number</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="account-actions">
              <button
                className={`account-confirmBtn ${isDirty ? "active" : ""}`}
                type="button"
                onClick={onClickConfirmChanges}
                disabled={!isDirty}
              >
                Confirm changes
              </button>

              <button className="account-logoutBtn" type="button" onClick={logout}>
                Log out
              </button>
            </div>
          </section>
        </main>

        {/* Confirm popup */}
        {showConfirm && (
          <div className="account-modalOverlay" role="dialog" aria-modal="true">
            <div className="account-modal">
              <h2>Confirm changes?</h2>

              <div className="account-modalButtons">
                <button className="account-modalYes" onClick={confirmYes}>
                  Yes
                </button>
                <button className="account-modalNo" onClick={confirmNo}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
