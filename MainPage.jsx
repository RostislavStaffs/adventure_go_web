import React, { useEffect, useMemo, useState } from "react";
import "./main.css";
import watermark from "./images/watermark.svg";
import { Link } from "react-router-dom";


function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatDateLabel(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const d = new Date(yyyyMmDd + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function daysBetweenInclusive(startYYYY, endYYYY) {
  const start = new Date(startYYYY + "T00:00:00");
  const end = new Date(endYYYY + "T00:00:00");
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  // inclusive days list
  return Array.from({ length: diff + 1 }, (_, i) => addDays(start, i));
}

export default function MainPage() {
  // auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // derive userId from token (so trips are per-user)
  const token = localStorage.getItem("token");
  const jwtPayload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const userId = jwtPayload?.userId || "guest";
  const tripsKey = `trips_${userId}`;

  // store trips in state (loaded from localStorage)
  const [trips, setTrips] = useState([]);

  // modal state
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showViewTrip, setShowViewTrip] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  // Add Trip form state
  const [destination, setDestination] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [tripName, setTripName] = useState("");
  const [summary, setSummary] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  //  load trips whenever userId changes (login/logout)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(tripsKey) || "[]");
      setTrips(saved);
    } catch {
      setTrips([]);
    }
  }, [tripsKey]);

  // persist trips
  useEffect(() => {
    localStorage.setItem(tripsKey, JSON.stringify(trips));
  }, [trips, tripsKey]);

  // close modal on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowAddTrip(false);
        setShowViewTrip(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openAddTrip = () => {
    setFormError("");
    setDestination("");
    setArrivalDate("");
    setDepartureDate("");
    setTripName("");
    setSummary("");
    setCoverFile(null);
    setShowAddTrip(true);
  };

  const createTrip = (e) => {
    e.preventDefault();
    setFormError("");

    if (!destination.trim()) return setFormError("Please select a destination.");
    if (!arrivalDate) return setFormError("Please select an arrival date.");
    if (!departureDate) return setFormError("Please select a departure date.");
    if (departureDate < arrivalDate)
      return setFormError("Departure date must be after arrival date.");
    if (!tripName.trim()) return setFormError("Please name your trip.");
    if (!coverFile) return setFormError("Please upload a cover photo.");

    const imageUrl = URL.createObjectURL(coverFile);

    const newTrip = {
      id: crypto.randomUUID(),
      title: tripName.trim(),
      location: destination.trim(),
      arrivalDate,
      departureDate,
      summary: summary.trim(),
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    setTrips((prev) => [newTrip, ...prev]);
    setShowAddTrip(false);
  };

  const openViewTrip = (trip) => {
    setActiveTrip(trip);
    setShowViewTrip(true);
  };

  return (
    <div className="main-page">
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
            {isLoggedIn ? (
              <Link to="/account" className="login">
                Account
              </Link>
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

      {/* CONTENT */}
      <main className="main-shell">
        <section className="main-board">
          <h1 className="main-title">Your Adventures</h1>

          <div className="main-grid">
            {/* render trips from state instead of demoTrips */}
            {trips.map((t) => (
              <article key={t.id} className="trip-card">
                <div className="trip-imageWrap">
                  <img src={t.image} alt="" />
                </div>

                <div className="trip-body">
                  <h3>{t.title}</h3>

                  <div className="trip-row">
                    <div className="trip-loc">
                      <span className="trip-pin" aria-hidden="true">
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

                    <button
                      className="trip-view"
                      type="button"
                      onClick={() => openViewTrip(t)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* + opens modal */}
            <button className="add-card" type="button" onClick={openAddTrip}>
              <span className="add-plus" aria-hidden="true">
                +
              </span>
              <span className="add-text">Add a Trip</span>
            </button>
          </div>

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

      {/** modal */}
      {showAddTrip && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowAddTrip(false)}
        >
          <div className="modal-card modal-addTrip" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow">
              <button
                className="modal-back"
                type="button"
                onClick={() => setShowAddTrip(false)}
                aria-label="Close"
              >
                ←
              </button>
              <div className="modal-title">Add Trip</div>
              <div className="modal-spacer" />
            </div>

            <div className="addTrip-cover">
              <label className="cover-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <div className="cover-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                    <path
                      d="M12 3v12"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 8l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 21h14"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="cover-text">
                  {coverFile ? coverFile.name : "Upload a cover photo"}
                </div>
              </label>
            </div>

            <form className="addTrip-form" onSubmit={createTrip}>
              {formError && <div className="modal-error">{formError}</div>}

              <div className="addTrip-row3">
                <div>
                  <label className="addTrip-label">Destination</label>
                  <div className="addTrip-inputWrap">
                    <span className="addTrip-icon" aria-hidden="true">
                      🔎
                    </span>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Select a destination"
                    />
                  </div>
                </div>

                <div>
                  <label className="addTrip-label">Arrival Date</label>
                  <div className="addTrip-inputWrap">
                    <span className="addTrip-icon" aria-hidden="true">
                      📅
                    </span>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="addTrip-label">Departure Date</label>
                  <div className="addTrip-inputWrap">
                    <span className="addTrip-icon" aria-hidden="true">
                      📅
                    </span>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="addTrip-row2">
                <div>
                  <label className="addTrip-label">Name your Trip</label>
                  <div className="addTrip-inputWrap">
                    <span className="addTrip-icon" aria-hidden="true">
                      🏷️
                    </span>
                    <input
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="Name your trip"
                    />
                  </div>
                </div>
              </div>

              <div className="addTrip-row2">
                <div>
                  <label className="addTrip-label">Add a summary of your trip</label>
                  <div className="addTrip-textareaWrap">
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Add a quick summary"
                    />
                  </div>
                </div>
              </div>

              <div className="addTrip-actions">
                <button className="addTrip-create" type="submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showViewTrip && activeTrip && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowViewTrip(false)}
        >
          <div className="modal-card modal-viewTrip" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow">
              <button
                className="modal-back"
                type="button"
                onClick={() => setShowViewTrip(false)}
                aria-label="Close"
              >
                ←
              </button>
              <div className="modal-title">{activeTrip.title}</div>
              <div className="modal-spacer" />
            </div>

            <div className="viewTrip-hero">
              <img src={activeTrip.image} alt="" />
            </div>

            <div className="viewTrip-meta">
              <div className="viewTrip-sub">
                {activeTrip.location} • {formatDateLabel(activeTrip.arrivalDate)} –{" "}
                {formatDateLabel(activeTrip.departureDate)}
              </div>
              {activeTrip.summary && <div className="viewTrip-summary">{activeTrip.summary}</div>}
            </div>

            <div className="viewTrip-timelineTitle">Timeline</div>

            {/* day buttons */}
            <div className="viewTrip-days">
              {daysBetweenInclusive(activeTrip.arrivalDate, activeTrip.departureDate).map((d) => (
                <button key={d.toISOString()} className="day-chip" type="button">
                  {d.toLocaleDateString(undefined, { day: "numeric" })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
