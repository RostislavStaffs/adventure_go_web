import React from "react";
import "./main.css";
import watermark from "./images/watermark.svg";
import { Link } from "react-router-dom";

// demo cards (later replace with data from backend)
const demoTrips = [
  {
    id: 1,
    title: "Trip to Barcelona",
    location: "Barcelona, Spain",
    image: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: 2,
    title: "Trip to Malé",
    location: "Malé, Maldives",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: 3,
    title: "Trip to London",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
  },
];

export default function MainPage() {
  return (
    <div className="main-page">
      {/* NAVBAR (same classes as landing.css) */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="logo">
            Adventure <span>GO</span>
          </div>

          <nav className="nav-links">
            <Link to="/main">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/account" className="login">
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="main-shell">
        <section className="main-board">
          <h1 className="main-title">Your Adventures</h1>

          <div className="main-grid">
            {demoTrips.map((t) => (
              <article key={t.id} className="trip-card">
                <div className="trip-imageWrap">
                  <img src={t.image} alt="" />
                </div>

                <div className="trip-body">
                  <h3>{t.title}</h3>

                  <div className="trip-row">
                    <div className="trip-loc">
                      <span className="trip-pin" aria-hidden="true">
                        {/* pin icon */}
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                          <path
                            d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="10"
                            r="2.2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                        </svg>
                      </span>
                      {t.location}
                    </div>

                    <button className="trip-view" type="button">
                      View
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* Add trip card */}
            <button className="add-card" type="button">
              <span className="add-plus" aria-hidden="true">
                +
              </span>
              <span className="add-text">Add a Trip</span>
            </button>
          </div>

          {/* pagination dots + arrows (static UI for now) */}
          <div className="main-pagination">
            <button className="page-btn" type="button" aria-label="Previous">
              ‹
            </button>
            <span className="page-dot active" />
            <span className="page-dot" />
            <button className="page-btn" type="button" aria-label="Next">
              ›
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER (same classes as landing.css) */}
      <footer className="footer">
        <img className="footer-watermark" src={watermark} alt="" aria-hidden="true" />
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Adventure GO</h3>
            <p>
              Where every journey becomes a chapter in your story. Record your
              adventures and revisit the moments that matter.
            </p>
            <p className="footer-copy">©2025 Adventure Go. All rights reserved.</p>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <Link to="/about">About us</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact us</Link>
          </div>

          <div className="footer-subscribe">
            <h4>Get updates</h4>
            <div className="subscribe">
              <input placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
