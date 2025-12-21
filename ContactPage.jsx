import React from "react";
import "./contact.css";
import planeImg from "./images/plane.jpg";
import { Link } from "react-router-dom";

export default function ContactPage() {
  // ✅ CHANGE: detect login from localStorage token (same logic as Main/About)
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <div className="contact-page">
      <div className="contact-shell">
        <header className="contact-topbar">
          <div className="contact-topbar-inner">
            <div className="contact-brand">
              Adventure <span>GO</span>
            </div>

            {/* ✅ CHANGE: if logged in show Account, else show Back (keeps old design layout) */}
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

              <form className="contact-form">
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
                      <input placeholder="First name" />
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
                      <input placeholder="Last name" />
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
                  <input placeholder="Email address" />
                </div>

                {/* ✅ RESTORED: phone number field */}
                <label className="contact-label">Phone number</label>
                <div className="contact-inputWrap">
                  <input placeholder="+44" />
                </div>

                {/* ✅ RESTORED: message + counter */}
                <label className="contact-label">Message</label>
                <div className="contact-textareaWrap">
                  <textarea placeholder="Enter your query here..." />
                  <span className="contact-counter">250/250</span>
                </div>

                {/* ✅ RESTORED: original button label */}
                <button className="contact-submit" type="button">
                  Submit form
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
