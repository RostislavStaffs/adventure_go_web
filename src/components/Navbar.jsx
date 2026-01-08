import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../landing.css"; // so it reuses your existing navbar styles

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Re-check login state whenever the route changes (simple + reliable)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [window.location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // if you store user info too
    setIsLoggedIn(false);
    navigate("/"); // or "/login"
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="logo">
          Adventure <span>GO</span>
        </div>

        <nav className="nav-links">
          <Link to={isLoggedIn ? "/main" : "/"}>Home</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <Link to="/account" className="login">
                Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="signup"
                style={{ cursor: "pointer" }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login">
                Login
              </Link>
              <Link to="/signup" className="signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
