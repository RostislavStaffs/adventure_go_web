import React, { useMemo, useState } from "react";
import "./contact.css";
import planeImg from "./images/plane.jpg";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000";

export default function ContactPage() {
  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem("token")), []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxLen = 250;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }
    if (message.length > maxLen) {
      setError("Message must be 250 characters or less");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit form");
        setSubmitting(false);
        return;
      }

      setSuccess(`Submitted. Your query id is ${data.query?.queryNumber}.`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSubmitting(false);
    } catch (err) {
      setError("Server not reachable");
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-shell">
        <header className="contact-topbar">
          <div className="contact-topbar-inner">
            <div className="contact-brand">
              Adventure <span>GO</span>
            </div>

            {isLoggedIn ? (
              <Link to="/main" className="contact-back">
                <span className="login-back-icon">←</span>
                Back
              </Link>
            ) : (
              <Link to="/" className="contact-back">
                <span className="contact-back-icon">←</span>
                Back
              </Link>
            )}
          </div>
        </header>

        <main className="contact-main">
          <section className="contact-grid">
            <div className="contact-imageCard">
              <img className="contact-image" src={planeImg} alt="" />

              <div className="contact-imageOverlay">
                <h3>Here to support you</h3>
                <p>
                  Customer satisfaction is our priority, and we encourage you to
                  let us know how we can support you.
                </p>
              </div>
            </div>

            <div className="contact-formCard">
              <h1>Get in touch</h1>

              {error && (
                <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "crimson" }}>
                  {error}
                </p>
              )}

              {success && (
                <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "green" }}>
                  {success}
                </p>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-row">
                  <div>
                    <label className="contact-label">First name</label>
                    <div className="contact-inputWrap">
                      <span className="contact-inputIcon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                          <path
                            d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="contact-label">Last name</label>
                    <div className="contact-inputWrap">
                      <span className="contact-inputIcon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                          <path
                            d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <label className="contact-label">Email Address</label>
                <div className="contact-inputWrap">
                  <span className="contact-inputIcon">
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
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <label className="contact-label">Phone number</label>
                <div className="contact-inputWrap">
                  <input
                    placeholder="+44"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <label className="contact-label">Message</label>
                <div className="contact-textareaWrap">
                  <textarea
                    placeholder="Enter your query here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, maxLen))}
                    maxLength={maxLen}
                  />
                  <span className="contact-counter">
                    {message.length}/{maxLen}
                  </span>
                </div>

                <button className="contact-submit" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit form"}
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
