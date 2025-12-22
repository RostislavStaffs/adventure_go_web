import React, { useEffect, useMemo, useState } from "react";
import "./main.css";
import watermark from "./images/watermark.svg";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000";

// ---------- helpers ----------
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
  return Array.from({ length: diff + 1 }, (_, i) => addDays(start, i));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function toUiTrip(apiTrip) {
  // API fields: destination, tripName, coverImage, _id etc.
  return {
    id: apiTrip._id,
    title: apiTrip.tripName || "",
    location: apiTrip.destination || "",
    arrivalDate: apiTrip.arrivalDate || "",
    departureDate: apiTrip.departureDate || "",
    summary: apiTrip.summary || "",
    image: apiTrip.coverImage || "",
    createdAt: apiTrip.createdAt,
    updatedAt: apiTrip.updatedAt,
  };
}

export default function MainPage() {
  // auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // userId from token
  const token = localStorage.getItem("token");
  const jwtPayload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const userId = jwtPayload?.userId || "guest";

  // trips
  const [trips, setTrips] = useState([]);

  // modals
  const [showTripForm, setShowTripForm] = useState(false); // Add/Edit modal
  const [showViewTrip, setShowViewTrip] = useState(false); // View modal
  const [activeTrip, setActiveTrip] = useState(null);

  // delete confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  // ---- Add/Edit mode ----
  const [editingTripId, setEditingTripId] = useState(null); // null = create, otherwise edit

  // form state
  const [destination, setDestination] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [tripName, setTripName] = useState("");
  const [summary, setSummary] = useState("");
  const [coverFile, setCoverFile] = useState(null); // for new upload
  const [coverPreview, setCoverPreview] = useState(""); // keeps existing image for edit
  const [formError, setFormError] = useState("");

  const authHeaders = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // keep navbar auth correct when navigating
  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  // load trips from MongoDB whenever user changes (login/logout)
  useEffect(() => {
    const loadTrips = async () => {
      const t = localStorage.getItem("token");
      if (!t) {
        setTrips([]);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/trips`, {
          headers: {
            ...authHeaders(),
          },
        });

        if (!res.ok) {
          // token invalid/expired -> clear client state
          if (res.status === 401) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setTrips([]);
            return;
          }
          throw new Error("Failed to load trips");
        }

        const data = await res.json();
        setTrips(Array.isArray(data) ? data.map(toUiTrip) : []);
      } catch (e) {
        console.error(e);
        setTrips([]);
      }
    };

    loadTrips();
  }, [userId]);

  // ESC to close any modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowTripForm(false);
        setShowViewTrip(false);
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------- helpers ----------
  const resetTripForm = () => {
    setFormError("");
    setDestination("");
    setArrivalDate("");
    setDepartureDate("");
    setTripName("");
    setSummary("");
    setCoverFile(null);
    setCoverPreview("");
    setEditingTripId(null);
  };

  // OPEN: Add Trip
  const openAddTrip = () => {
    resetTripForm();
    setShowTripForm(true);
  };

  // OPEN: Edit Trip (prefill form)
  const openEditTrip = (trip) => {
    setFormError("");
    setEditingTripId(trip.id);

    setDestination(trip.location || "");
    setArrivalDate(trip.arrivalDate || "");
    setDepartureDate(trip.departureDate || "");
    setTripName(trip.title || "");
    setSummary(trip.summary || "");

    // keep existing image
    setCoverFile(null);
    setCoverPreview(trip.image || "");

    setShowTripForm(true);
  };

  // CREATE/UPDATE Trip (MongoDB)
  const submitTripForm = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!destination.trim()) return setFormError("Please select a destination.");
    if (!arrivalDate) return setFormError("Please select an arrival date.");
    if (!departureDate) return setFormError("Please select a departure date.");
    if (departureDate < arrivalDate)
      return setFormError("Departure date must be after arrival date.");
    if (!tripName.trim()) return setFormError("Please name your trip.");

    // For CREATE, require image. For EDIT, allow keeping old image.
    let finalImage = coverPreview;

    try {
      if (coverFile) {
        finalImage = await fileToDataUrl(coverFile); // persists in MongoDB
      }
    } catch {
      return setFormError("Could not read the image. Please try another file.");
    }
const submitTripForm = (e) => {
  e.preventDefault();
  setFormError("");

  if (!destination.trim()) return setFormError("Please select a destination.");
  if (!arrivalDate) return setFormError("Please select an arrival date.");
  if (!departureDate) return setFormError("Please select a departure date.");
  if (departureDate < arrivalDate)
    return setFormError("Departure date must be after arrival date.");
  if (!tripName.trim()) return setFormError("Please name your trip.");

  
  if (coverFile && coverFile.size > 2 * 1024 * 1024) {
    setFormError("Image too large (max 2MB). Please choose a smaller one.");
    return;
  }
}
  // existing image logic below

    if (!finalImage) return setFormError("Please upload a cover photo.");

    const payload = {
      destination: destination.trim(),
      arrivalDate,
      departureDate,
      tripName: tripName.trim(),
      summary: summary.trim(),
      coverImage: finalImage,
    };

    try {
      const t = localStorage.getItem("token");
      if (!t) return setFormError("You must be logged in.");

      if (!editingTripId) {
        // CREATE
        const res = await fetch(`${API_BASE}/api/trips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          return setFormError(data?.message || "Failed to create trip.");
        }

        setTrips((prev) => [toUiTrip(data), ...prev]);
      } else {
        // UPDATE
        const res = await fetch(`${API_BASE}/api/trips/${editingTripId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          return setFormError(data?.message || "Failed to update trip.");
        }

        const updatedUiTrip = toUiTrip(data);

        setTrips((prev) =>
          prev.map((t) => (t.id === editingTripId ? updatedUiTrip : t))
        );

        // keep View modal in sync
        if (activeTrip?.id === editingTripId) {
          setActiveTrip(updatedUiTrip);
        }
      }

      setShowTripForm(false);
      resetTripForm();
    } catch (err) {
      console.error(err);
      setFormError("Server not reachable (is backend running on :4000?)");
    }
  };

  // OPEN: View Trip
  const openViewTrip = (trip) => {
    setActiveTrip(trip);
    setShowViewTrip(true);
  };

  // DELETE flow
  const askDeleteTrip = (trip) => {
    setTripToDelete(trip);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripToDelete.id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(data?.message || "Failed to delete trip.");
        return;
      }

      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));

      // close view modal if it was open for this trip
      if (activeTrip?.id === tripToDelete.id) {
        setShowViewTrip(false);
        setActiveTrip(null);
      }

      setShowDeleteConfirm(false);
      setTripToDelete(null);
    } catch (err) {
      console.error(err);
      setFormError("Server not reachable (is backend running on :4000?)");
    }
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

                    <button className="trip-view" type="button" onClick={() => openViewTrip(t)}>
                      View
                    </button>
                  </div>
                </div>
              </article>
            ))}

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
              Where every journey becomes a chapter in your story. Record your adventures and
              revisit the moments that matter.
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

      {/* =========================
          ADD / EDIT TRIP MODAL
         ========================= */}
      {showTripForm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowTripForm(false)}
        >
          <div className="modal-card modal-addTrip" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow">
              <button className="modal-back" type="button" onClick={() => setShowTripForm(false)}>
                ←
              </button>
              <div className="modal-title">{editingTripId ? "Edit Trip" : "Add Trip"}</div>
              <div className="modal-spacer" />
            </div>

            <div className="addTrip-cover">
              <label className="cover-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setCoverFile(f);
                    if (f) setCoverPreview(URL.createObjectURL(f));
                  }}
                  style={{ display: "none" }}
                />

                {/* show preview if we have one */}
                {coverPreview ? (
                  <img className="cover-preview" src={coverPreview} alt="" />
                ) : (
                  <>
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
                    <div className="cover-text">Upload a cover photo</div>
                  </>
                )}
              </label>
            </div>

            <form className="addTrip-form" onSubmit={submitTripForm}>
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
                  {editingTripId ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          VIEW TRIP MODAL
         ========================= */}
      {showViewTrip && activeTrip && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowViewTrip(false)}
        >
          <div className="modal-card modal-viewTrip" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow viewTopRow">
              <button className="modal-back" type="button" onClick={() => setShowViewTrip(false)}>
                ←
              </button>

              <div className="modal-title">{activeTrip.title}</div>

              {/* right actions (Delete / Edit) */}
              <div className="viewTrip-actionsTop">
                <button
                  type="button"
                  className="viewTrip-danger"
                  onClick={() => askDeleteTrip(activeTrip)}
                >
                  Delete Trip
                </button>
                <button
                  type="button"
                  className="viewTrip-ghost"
                  onClick={() => {
                    setShowViewTrip(false);
                    openEditTrip(activeTrip);
                  }}
                >
                  Edit Trip
                </button>
              </div>
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

      {/* =========================
          DELETE CONFIRM MODAL
         ========================= */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowDeleteConfirm(false)}
        >
          <div className="confirm-card" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Are you sure you want to delete this trip?</h2>

            <div className="confirm-actions">
              <button className="confirm-yes" type="button" onClick={confirmDeleteTrip}>
                Yes
              </button>
              <button
                className="confirm-no"
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
