import React, { useEffect, useMemo, useRef, useState } from "react";
import "./account.css";
import { Link, useNavigate } from "react-router-dom";

export default function AdminAccountPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarBase64: "",
  });

  const [saved, setSaved] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarBase64: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load admin on page load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/admin/login");
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

        // Safety check: admin only
        if (!data.user.isAdmin) {
          navigate("/login");
          return;
        }

        const user = { avatarBase64: "", ...data.user };
        setForm(user);
        setSaved(user);
        setLoading(false);
      } catch {
        setError("Server not reachable");
        setLoading(false);
      }
    })();
  }, [navigate]);

  const fullName = useMemo(() => {
    const fn = (form.firstName || "").trim();
    const ln = (form.lastName || "").trim();
    const name = `${fn} ${ln}`.trim();
    return name || "Admin";
  }, [form.firstName, form.lastName]);

  const isDirty =
    form.firstName !== saved.firstName ||
    form.lastName !== saved.lastName ||
    form.email !== saved.email ||
    form.phone !== saved.phone ||
    (form.avatarBase64 || "") !== (saved.avatarBase64 || "");

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
      navigate("/admin/login");
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
          avatarBase64: form.avatarBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save changes.");
        setShowConfirm(false);
        return;
      }

      const user = { avatarBase64: "", ...data.user };
      setSaved(user);
      setForm(user);
      setShowConfirm(false);
    } catch {
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
    navigate("/admin/login");
  }

  function onPickImageClick() {
    setError("");
    fileInputRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > 2 * 1024 * 1024) {
      setError("Image too large. Please choose an image under 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("avatarBase64", String(reader.result || ""));
    };
    reader.readAsDataURL(file);

    e.target.value = "";
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

            <Link to="/admin/dashboard" className="account-back">
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

            {/* Profile card */}
            <div className="account-profileCard">
              <div className="account-avatar" aria-hidden="true">
                {form.avatarBase64 ? (
                  <img src={form.avatarBase64} alt="Profile" />
                ) : null}
              </div>

              <div className="account-profileText">
                <div className="account-name">{fullName}</div>
                <div className="account-role">Admin</div>
              </div>

              <button className="account-uploadBtn" type="button" onClick={onPickImageClick}>
                Upload
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onFileChange}
              />
            </div>

            {/* Input grid */}
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

            {/* Actions */}
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

        {/* Confirm modal */}
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
