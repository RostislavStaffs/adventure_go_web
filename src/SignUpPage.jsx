import React, { useState } from "react";
import "./signup.css";
import planeImg from "./images/plane.jpg";
import { Link } from "react-router-dom";



export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [firstName] = useState("");
  const [lastName] = useState("");
  const [phone] = useState("");

    const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      window.location.href = "/login";
    } catch (err) {
      setError("Server not reachable");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-shell">
       
        <header className="signup-topbar">
          <div className="signup-topbar-inner">
            <div className="signup-brand">
              Adventure <span>GO</span>
            </div>

            <Link to="/" className="signup-back">
            <span className="signup-back-icon">←</span>
            Back
            </Link>

          </div>
        </header>

        
        <main className="signup-main">
          <section className="signup-grid">
            
            <div className="signup-imageCard">
              <img className="signup-image" src={planeImg} alt="" />

              <div className="signup-imageOverlay">
                <h3>Start your journey today</h3>
                <p>
                  Sign up today to begin capturing your adventures and preserving
                  every memory in one unforgettable journey.
                </p>
              </div>
            </div>

            {/* Right form card */}
            
            <div className="signup-formCard">
              <h1>Create an Account</h1>
              <p className="signup-subtitle">
                Start documenting your adventures and keep every moment safely
                preserved along the way.
              </p>
              {error && <p className="signup-error">{error}</p>}


              <form className="signup-form" onSubmit={handleSignup}>

  

  <label className="signup-label" htmlFor="email">Email</label>
  <div className="signup-inputWrap">
    <span className="signup-inputIcon" aria-hidden="true">
      {/* mail icon */}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M4.5 7.5l7.1 4.7c.25.17.55.25.9.25s.65-.08.9-.25l7.1-4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 18h11.6c1 0 1.7-.8 1.7-1.7V7.7c0-1-.8-1.7-1.7-1.7H6.2c-1 0-1.7.8-1.7 1.7v8.6c0 1 .8 1.7 1.7 1.7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <input
      id="email"
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  <label className="signup-label" htmlFor="password">Password</label>
  <div className="signup-inputWrap">
    <span className="signup-inputIcon" aria-hidden="true">
      {/* lock icon */}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M7.5 11V8.9c0-2.6 1.9-4.7 4.5-4.7s4.5 2.1 4.5 4.7V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.2 19.5h9.6c1 0 1.7-.8 1.7-1.7v-5.1c0-1-.8-1.7-1.7-1.7H7.2c-1 0-1.7.8-1.7 1.7v5.1c0 1 .8 1.7 1.7 1.7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <input
      id="password"
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  <label className="signup-label" htmlFor="password2">Re-Enter Password</label>
  <div className="signup-inputWrap">
    <span className="signup-inputIcon" aria-hidden="true">
      {/* lock icon */}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M7.5 11V8.9c0-2.6 1.9-4.7 4.5-4.7s4.5 2.1 4.5 4.7V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.2 19.5h9.6c1 0 1.7-.8 1.7-1.7v-5.1c0-1-.8-1.7-1.7-1.7H7.2c-1 0-1.7.8-1.7 1.7v5.1c0 1 .8 1.7 1.7 1.7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <input
      id="password2"
      type="password"
      placeholder="Re-Enter Password"
      value={password2}
      onChange={(e) => setPassword2(e.target.value)}
    />
  </div>

  <div className="signup-loginRow">
    <span>Already have an account?</span>
    <Link to="/login">Log in</Link>
  </div>

  <button className="signup-submit" type="submit">
    Sign up
  </button>
</form>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
