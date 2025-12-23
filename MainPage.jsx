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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// safe local YYYY-MM-DD
function toYYYYMMDD(d) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// normalize step.date to YYYY-MM-DD for matching
function normalizeYYYYMMDD(val) {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  const d = new Date(val);
  return toYYYYMMDD(d);
}

function getStepForDate(trip, dateStr) {
  const target = normalizeYYYYMMDD(dateStr);
  return trip?.steps?.find((s) => normalizeYYYYMMDD(s.date) === target) || null;
}

function formatDateLabel(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const d = new Date(yyyyMmDd + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDateLabelPretty(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const d = new Date(yyyyMmDd + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "long" });
  return `${ordinal(day)} of ${month}`;
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
    steps: Array.isArray(apiTrip.steps) ? apiTrip.steps : [],
  };
}

export default function MainPage() {
  // auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const token = localStorage.getItem("token");
  const jwtPayload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const userId = jwtPayload?.userId || "guest";

  // trips
  const [trips, setTrips] = useState([]);

  // modals
  const [showTripForm, setShowTripForm] = useState(false); // Add/Edit modal
  const [showViewTrip, setShowViewTrip] = useState(false); // View modal
  const [activeTrip, setActiveTrip] = useState(null);

  // View Step modal
  const [showViewStep, setShowViewStep] = useState(false);
  const [viewStepTrip, setViewStepTrip] = useState(null);
  const [viewStep, setViewStep] = useState(null);
  const [viewPhotoIdx, setViewPhotoIdx] = useState(0);

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

  // =========================
  // Add Step modal state
  // =========================
  const [showAddStep, setShowAddStep] = useState(false);
  const [stepTrip, setStepTrip] = useState(null); // which trip we’re adding a step to
  const [stepDayISO, setStepDayISO] = useState(""); // yyyy-mm-dd
  const [stepName, setStepName] = useState("");
  const [stepDate, setStepDate] = useState(""); // input date
  const [stepOverview, setStepOverview] = useState("");
  const [stepPhotos, setStepPhotos] = useState([]); // File[]
  const [stepExistingPhotos, setStepExistingPhotos] = useState([]); // base64 strings already saved
  const [stepSpots, setStepSpots] = useState([]); // spots are empty unless user adds them
  const [stepError, setStepError] = useState("");

  // track when the step modal is editing an existing step
  const [editingStepId, setEditingStepId] = useState(null); // step._id (if your backend provides it)

  // =========================
  // Add “Add a spot” modal state + Photon search
  // =========================
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [spotQuery, setSpotQuery] = useState("");
  const [spotResults, setSpotResults] = useState([]); // Photon-mapped results
  const [spotLoading, setSpotLoading] = useState(false);
  const [spotErr, setSpotErr] = useState("");

  // =========================
  // Spot Details modal state
  // =========================
  const [showSpotDetail, setShowSpotDetail] = useState(false);
  const [spotDraft, setSpotDraft] = useState(null); // currently picked/edited spot object
  const [spotNote, setSpotNote] = useState("");
  const [spotPhotoFile, setSpotPhotoFile] = useState(null);
  const [spotPhotoPreview, setSpotPhotoPreview] = useState("");
  const [editingSpotId, setEditingSpotId] = useState(null); // null for new, else existing spot.id

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
          headers: { ...authHeaders() },
        });

        if (!res.ok) {
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
        setShowAddStep(false);
        setShowAddSpot(false);
        setShowViewStep(false);

        setShowSpotDetail(false);
        setSpotDraft(null);
        setSpotNote("");
        setSpotPhotoFile(null);
        setSpotPhotoPreview("");
        setEditingSpotId(null);

        setEditingStepId(null);
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

  const openAddTrip = () => {
    resetTripForm();
    setShowTripForm(true);
  };

  const openEditTrip = (trip) => {
    setFormError("");
    setEditingTripId(trip.id);

    setDestination(trip.location || "");
    setArrivalDate(trip.arrivalDate || "");
    setDepartureDate(trip.departureDate || "");
    setTripName(trip.title || "");
    setSummary(trip.summary || "");

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
    if (departureDate < arrivalDate) return setFormError("Departure date must be after arrival date.");
    if (!tripName.trim()) return setFormError("Please name your trip.");

    if (coverFile && coverFile.size > 2 * 1024 * 1024) {
      setFormError("Image too large (max 2MB). Please choose a smaller one.");
      return;
    }

    let finalImage = coverPreview;

    try {
      if (coverFile) {
        finalImage = await fileToDataUrl(coverFile);
      }
    } catch {
      return setFormError("Could not read the image. Please try another file.");
    }

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
        const res = await fetch(`${API_BASE}/api/trips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) return setFormError(data?.message || "Failed to create trip.");

        setTrips((prev) => [toUiTrip(data), ...prev]);
      } else {
        const res = await fetch(`${API_BASE}/api/trips/${editingTripId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) return setFormError(data?.message || "Failed to update trip.");

        const updatedUiTrip = toUiTrip(data);

        setTrips((prev) => prev.map((t) => (t.id === editingTripId ? updatedUiTrip : t)));

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

  const openViewTrip = (trip) => {
    setActiveTrip(trip);
    setShowViewTrip(true);
  };

  const askDeleteTrip = (trip) => {
    setTripToDelete(trip);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/trips/${tripToDelete.id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFormError(data?.message || "Failed to delete trip.");
        return;
      }

      setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));

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

  // Open “Add a step” from a day button (or from View Step Edit)
  const openAddStep = (trip, dateObj, existingStep = null) => {
    const iso = toYYYYMMDD(dateObj);

    setStepTrip(trip);
    setStepDayISO(iso);
    setStepError("");

    if (existingStep) {
      setEditingStepId(existingStep._id || existingStep.id || null);

      setStepName(existingStep.title || "");
      setStepDate(normalizeYYYYMMDD(existingStep.date) || iso);
      setStepOverview(existingStep.overview || "");
      setStepSpots(Array.isArray(existingStep.spots) ? existingStep.spots : []);
      setStepExistingPhotos(Array.isArray(existingStep.photos) ? existingStep.photos : []);
      setStepPhotos([]);
    } else {
      setEditingStepId(null);

      setStepName("");
      setStepDate(iso);
      setStepOverview("");
      setStepPhotos([]);
      setStepExistingPhotos([]);
      setStepSpots([]);
    }

    setShowAddStep(true);
  };

  // open View Step modal from a step card
  const openViewStepModal = (trip, step) => {
    setViewStepTrip(trip);
    setViewStep(step);
    setViewPhotoIdx(0);

    setShowViewTrip(false);
    setShowViewStep(true);
  };

  const closeViewStepToTrip = () => {
    setShowViewStep(false);
    setViewStep(null);
    setViewStepTrip(null);
    if (activeTrip) setShowViewTrip(true);
  };

  const onEditDayFromViewStep = () => {
    if (!viewStepTrip || !viewStep) return;
    setShowViewStep(false);
    openAddStep(viewStepTrip, new Date(normalizeYYYYMMDD(viewStep.date) + "T00:00:00"), viewStep);
  };

  const closeStepModal = () => {
    setShowAddStep(false);
    setStepTrip(null);
    setStepError("");
    setEditingStepId(null);
  };

  const submitStep = async (e) => {
    e.preventDefault();
    setStepError("");

    if (!stepName.trim()) return setStepError("Please name this step.");
    if (!stepDate) return setStepError("Please choose a date.");
    if (!stepOverview.trim()) return setStepError("Please write an overview of the day.");
    if (!activeTrip?.id) return setStepError("No active trip selected.");

    try {
      const token = localStorage.getItem("token");
      if (!token) return setStepError("Not logged in.");

      const photosBase64 = [];
      for (const f of stepPhotos || []) {
        if (f.size > 2 * 1024 * 1024) {
          setStepError("Image too large (max 2MB). Please choose a smaller one.");
          return;
        }
        photosBase64.push(await fileToBase64(f));
      }

      const finalPhotos = [...(stepExistingPhotos || []), ...photosBase64];

      const res = await fetch(`${API_BASE}/api/trips/${activeTrip.id}/steps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          // If your backend supports upsert by date, this is enough.
          // If it supports step id updates, you can also include: stepId: editingStepId
          date: stepDate,
          title: stepName.trim(),
          overview: stepOverview.trim(),
          photos: finalPhotos,
          spots: stepSpots || [],
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to save step");

      const updatedApiTrip = data?.trip ?? data;
      const updatedUiTrip = toUiTrip(updatedApiTrip);

      setTrips((prev) => prev.map((t) => (t.id === updatedUiTrip.id ? updatedUiTrip : t)));
      setActiveTrip(updatedUiTrip);

      closeStepModal();
    } catch (err) {
      console.error(err);
      setStepError(err.message || "Failed to save step");
    }
  };

  // remove step 
  const removeStep = async () => {
    setStepError("");

    if (!activeTrip?.id) return setStepError("No active trip selected.");
    if (!editingStepId && !stepDate) return setStepError("Missing step identifier/date.");

    const ok = window.confirm("Remove this step? This cannot be undone.");
    if (!ok) return;

    try {
      // Try a few common delete patterns 
      const candidates = [];
      // date-based deletion
      candidates.push(`${API_BASE}/api/trips/${activeTrip.id}/steps?date=${encodeURIComponent(stepDate)}`);
      

      let lastRes = null;
      let successData = null;

      for (const url of candidates) {
        const res = await fetch(url, { method: "DELETE", headers: { ...authHeaders() } });
        lastRes = res;

        if (res.ok) {
          // may return updated trip, or may be 204
          const data = await res.json().catch(() => null);
          successData = data;
          break;
        }

        // if it's not found, try next candidate
        if (res.status === 404) continue;

        // any other failure -> stop and show error message
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to delete step");
      }

      if (!lastRes?.ok) {
        // All candidates failed (likely backend route not implemented)
        throw new Error("Failed to delete step (no matching DELETE route found).");
      }

      // If backend returned an updated trip
      if (successData?.trip || successData?._id) {
        const updatedApiTrip = successData.trip ?? successData;
        const updatedUiTrip = toUiTrip(updatedApiTrip);

        setTrips((prev) => prev.map((t) => (t.id === updatedUiTrip.id ? updatedUiTrip : t)));
        setActiveTrip(updatedUiTrip);
      } else {
        // If backend returned no body (204), update UI locally by date
        const updatedLocal = {
          ...activeTrip,
          steps: (activeTrip.steps || []).filter((s) => normalizeYYYYMMDD(s.date) !== normalizeYYYYMMDD(stepDate)),
        };

        setTrips((prev) => prev.map((t) => (t.id === updatedLocal.id ? updatedLocal : t)));
        setActiveTrip(updatedLocal);
      }

      closeStepModal();
    } catch (err) {
      console.error(err);
      setStepError(err?.message || "Failed to delete step");
    }
  };

  // Open “Add a spot” modal from Add Step
  const openAddSpot = () => {
    setSpotQuery("");
    setSpotResults([]);
    setSpotErr("");
    setShowAddSpot(true);
  };

  // Photon search (debounced)
  useEffect(() => {
    if (!showAddSpot) return;

    const q = spotQuery.trim();
    if (q.length < 2) {
      setSpotResults([]);
      setSpotErr("");
      return;
    }

    const t = setTimeout(async () => {
      try {
        setSpotLoading(true);
        setSpotErr("");

        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Photon request failed");

        const data = await res.json();
        const features = Array.isArray(data?.features) ? data.features : [];

        const mapped = features.map((f) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [];
          return {
            id: `ph_${p.osm_type || ""}_${p.osm_id || ""}_${crypto.randomUUID()}`,
            name: p.name || p.street || p.city || "Unknown place",
            photon: {
              osm_id: p.osm_id,
              osm_type: p.osm_type,
              lat: coords[1],
              lon: coords[0],
              country: p.country,
              city: p.city,
              postcode: p.postcode,
              street: p.street,
              housenumber: p.housenumber,
            },
            note: "",
            photo: "",
          };
        });

        setSpotResults(mapped);
      } catch (e) {
        setSpotErr(e?.message || "Failed to search places");
        setSpotResults([]);
      } finally {
        setSpotLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [spotQuery, showAddSpot]);

  const onPickPhotonSpot = (photonSpot) => {
    setSpotDraft(photonSpot);
    setSpotNote("");
    setSpotPhotoFile(null);
    setSpotPhotoPreview("");
    setEditingSpotId(null);

    setShowAddSpot(false);
    setShowSpotDetail(true);
  };

  const onEditExistingSpot = (spot) => {
    setSpotDraft(spot);
    setSpotNote(spot?.note || "");
    setSpotPhotoFile(null);
    setSpotPhotoPreview(spot?.photo || "");
    setEditingSpotId(spot?.id || null);
    setShowSpotDetail(true);
  };

  const closeSpotDetail = () => {
    setShowSpotDetail(false);
    setSpotDraft(null);
    setSpotNote("");
    setSpotPhotoFile(null);
    setSpotPhotoPreview("");
    setEditingSpotId(null);
  };

  const saveSpotDetail = () => {
    if (!spotDraft) return;

    const finalSpot = {
      ...spotDraft,
      id: editingSpotId || `spot_${crypto.randomUUID()}`,
      note: (spotNote || "").trim(),
      photo: spotPhotoPreview || spotDraft.photo || "",
    };

    setStepSpots((prev) => {
      if (editingSpotId) {
        return prev.map((s) => (s.id === editingSpotId ? finalSpot : s));
      }

      const prevHasSame =
        prev.some(
          (p) => p?.photon?.osm_id && finalSpot?.photon?.osm_id && p.photon.osm_id === finalSpot.photon.osm_id
        ) || prev.some((p) => (p?.name || "").toLowerCase() === (finalSpot?.name || "").toLowerCase());

      if (prevHasSame) return prev;
      return [...prev, finalSpot];
    });

    closeSpotDetail();
  };

  // remove spot 
  const removeSpot = () => {
    if (!editingSpotId) return;
    const ok = window.confirm("Remove this spot?");
    if (!ok) return;

    setStepSpots((prev) => prev.filter((s) => s.id !== editingSpotId));
    closeSpotDetail();
  };

  const makeHighlightQuote = (spotName) => `“${spotName} was one of the best moments of the day.”`;

  const isEditingStep = !!editingStepId;

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
                          <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
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
              Where every journey becomes a chapter in your story. Record your adventures and revisit the moments that
              matter.
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
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={() => setShowTripForm(false)}>
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

                {coverPreview ? (
                  <img className="cover-preview" src={coverPreview} alt="" />
                ) : (
                  <>
                    <div className="cover-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                        <path d="M12 3v12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path
                          d="M7 8l5-5 5 5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M5 21h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
                    <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="addTrip-label">Departure Date</label>
                  <div className="addTrip-inputWrap">
                    <span className="addTrip-icon" aria-hidden="true">
                      📅
                    </span>
                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
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
                    <input value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="Name your trip" />
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
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={() => setShowViewTrip(false)}>
          <div className="modal-card modal-viewTrip" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow viewTopRow">
              <button className="modal-back" type="button" onClick={() => setShowViewTrip(false)}>
                ←
              </button>

              <div className="modal-title">{activeTrip.title}</div>

              <div className="viewTrip-actionsTop">
                <button type="button" className="viewTrip-danger" onClick={() => askDeleteTrip(activeTrip)}>
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
              {daysBetweenInclusive(activeTrip.arrivalDate, activeTrip.departureDate).map((d) => {
                const dayStr = toYYYYMMDD(d);
                const step = getStepForDate(activeTrip, dayStr);

                return step ? (
                  <button
                    key={dayStr}
                    className="timeline-stepCard"
                    type="button"
                    onClick={() => openViewStepModal(activeTrip, step)}
                  >
                    <div className="timeline-stepThumb">{step.photos?.[0] ? <img src={step.photos[0]} alt="" /> : null}</div>
                    <div className="timeline-stepMeta">
                      <div className="timeline-stepTitle">{step.title}</div>
                      <div className="timeline-stepSub">{activeTrip.location}</div>
                      <div className="timeline-stepCounts">
                        <span>📍 {step.spots?.length || 0}</span>
                        <span>🖼 {step.photos?.length || 0}</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    key={dayStr}
                    className="timeline-plus"
                    type="button"
                    onClick={() => openAddStep(activeTrip, new Date(dayStr + "T00:00:00"))}
                    aria-label={`Add step for ${dayStr}`}
                  >
                    +
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================
          VIEW STEP MODAL
         ========================= */}
      {showViewStep && viewStepTrip && viewStep && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={closeViewStepToTrip}>
          <div className="modal-card modal-viewStep" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow viewStepTopRow">
              <button className="modal-back" type="button" onClick={closeViewStepToTrip}>
                ←
              </button>

              <div className="modal-title">{viewStep.title || "View Step"}</div>

              <div className="viewStepTopActions">
                <button type="button" className="viewStepEditBtn" onClick={onEditDayFromViewStep}>
                  Edit day
                </button>
              </div>
            </div>

            <div className="viewStep-body">
              <div className="viewStep-topGrid">
                <div className="viewStep-photoWrap">
                  <div className="viewStep-photoFrame">
                    {viewStep.photos?.length ? (
                      <img src={viewStep.photos[Math.min(viewPhotoIdx, viewStep.photos.length - 1)]} alt="" />
                    ) : (
                      <div className="viewStep-photoPlaceholder">No photo</div>
                    )}

                    {viewStep.photos?.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="viewStep-arrow viewStep-arrowLeft"
                          onClick={() =>
                            setViewPhotoIdx((p) => (p - 1 + viewStep.photos.length) % viewStep.photos.length)
                          }
                          aria-label="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="viewStep-arrow viewStep-arrowRight"
                          onClick={() => setViewPhotoIdx((p) => (p + 1) % viewStep.photos.length)}
                          aria-label="Next photo"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="viewStep-overviewCard">
                  <div className="viewStep-overviewHeader">
                    <div className="viewStep-overviewTitle">Overview of the day</div>
                    <div className="viewStep-overviewDate">
                      {formatDateLabelPretty(normalizeYYYYMMDD(viewStep.date))}
                    </div>
                  </div>

                  <div className="viewStep-overviewText">{viewStep.overview || "No overview written yet."}</div>
                </div>
              </div>

              <div className="viewStep-highlightsTitle">Highlights</div>

              <div className="viewStep-highlightsGrid">
                {(viewStep.spots?.length ? viewStep.spots : []).slice(0, 3).map((spot, idx) => (
                  <div key={spot.id || `${spot.name}_${idx}`} className="viewStep-highlightCard">
                    <div className="viewStep-highlightName">{spot.name}</div>

                    <div className="viewStep-highlightQuote">
                      {spot?.note?.trim() ? `“${spot.note.trim()}”` : makeHighlightQuote(spot.name)}
                    </div>

                    <div className="viewStep-highlightImg">
                      {spot?.photo ? <img src={spot.photo} alt="" /> : <div className="viewStep-highlightImgPh" />}
                    </div>
                  </div>
                ))}

                {(!viewStep.spots || viewStep.spots.length === 0) && (
                  <div style={{ opacity: 0.75, fontWeight: 800, padding: "10px 2px" }}>No spots yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ADD / EDIT STEP MODAL
         ========================= */}
      {showAddStep && stepTrip && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={closeStepModal}>
          <div className="modal-card modal-step" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow stepTopRow">
              <button className="modal-back" type="button" onClick={closeStepModal}>
                ←
              </button>

              <div className="modal-title">Add a step</div>

              <div className="stepTopActions">
                {isEditingStep ? (
                  <>
                    <button className="stepDangerBtn" type="button" onClick={removeStep}>
                      Remove step
                    </button>
                    <button className="stepGhostBtn" type="submit" form="addStepForm">
                      Confirm changes
                    </button>
                  </>
                ) : (
                  <button className="stepPrimaryBtn" type="submit" form="addStepForm">
                    Add step
                  </button>
                )}
              </div>
            </div>

            <div className="step-body">
              <form id="addStepForm" onSubmit={submitStep}>
                {stepError && <div className="modal-error">{stepError}</div>}

                <section className="step-card">
                  <div className="step-topGrid">
                    <div className="step-left">
                      <div className="step-group">
                        <div className="step-h">Name this step</div>
                        <div className="step-pill">
                          <span className="step-icon" aria-hidden="true">
                            🏷️
                          </span>
                          <input
                            value={stepName}
                            onChange={(e) => setStepName(e.target.value)}
                            placeholder='E.g. "A day in El Born"'
                          />
                        </div>
                      </div>

                      <div className="step-group">
                        <div className="step-h">Date</div>
                        <div className="step-pill step-pillShort">
                          <span className="step-icon" aria-hidden="true">
                            📅
                          </span>
                          <input type="date" value={stepDate} onChange={(e) => setStepDate(e.target.value)} />
                        </div>
                      </div>

                      <div className="step-photoRow">
                        <label className="step-photoBox">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setStepPhotos(files);
                            }}
                            style={{ display: "none" }}
                          />
                          <span className="step-photoIcon" aria-hidden="true">
                            📷
                          </span>
                        </label>

                        <div className="step-photoText">
                          Add photos{" "}
                          {(stepExistingPhotos?.length || stepPhotos?.length) ? (
                            <span style={{ opacity: 0.7, marginLeft: 6 }}>
                              ({(stepExistingPhotos?.length || 0) + (stepPhotos?.length || 0)})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="step-divider" />

                    <div className="step-right step-rightSpots">
                      <div className="step-h step-hSmall">Spots you have visited</div>

                      <div className="step-spots">
                        {stepSpots.map((s) => (
                          <button
                            key={s.id || s.name}
                            type="button"
                            className="step-spotPill"
                            onClick={() => onEditExistingSpot(s)}
                          >
                            <span className="step-spotThumb" aria-hidden="true" />
                            <span className="step-spotName">{s.name}</span>
                          </button>
                        ))}

                        <button type="button" className="step-spotAdd" onClick={openAddSpot}>
                          <span className="step-spotAddIcon" aria-hidden="true">
                            📍
                          </span>
                          Add another spot
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="step-card step-overviewCard">
                  <div className="step-overviewInner">
                    <div className="step-bottomTitle">Overview of the day</div>
                    <textarea
                      className="step-textarea"
                      value={stepOverview}
                      onChange={(e) => setStepOverview(e.target.value)}
                      placeholder="Write a bit about your day"
                    />
                  </div>
                </section>

                <input type="hidden" value={stepDayISO} readOnly />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ADD A SPOT MODAL (Photon)
         ========================= */}
      {showAddSpot && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={() => setShowAddSpot(false)}>
          <div className="modal-card modal-spot" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow spotTopRow">
              <button className="modal-back" type="button" onClick={() => setShowAddSpot(false)}>
                ←
              </button>

              <div className="modal-title">Add a spot</div>

              <div className="modal-spacer" />
            </div>

            <div className="spot-body">
              <div className="spot-stage">
                <div className="spot-picker">
                  <div className="spot-heading">Pick a spot</div>

                  <div className="spot-search">
                    <span className="spot-searchIcon" aria-hidden="true">
                      ▢
                    </span>
                    <input value={spotQuery} onChange={(e) => setSpotQuery(e.target.value)} placeholder="Search a spot" />
                  </div>

                  {spotErr ? <div className="modal-error">{spotErr}</div> : null}
                  {spotLoading ? (
                    <div style={{ textAlign: "center", fontWeight: 800, opacity: 0.7, padding: "10px 0" }}>
                      Searching…
                    </div>
                  ) : null}

                  <div className="spot-list">
                    {(spotResults.length ? spotResults : []).map((s) => (
                      <button key={s.id} type="button" className="spot-item" onClick={() => onPickPhotonSpot(s)}>
                        <span className="spot-thumb" aria-hidden="true" />
                        <span className="spot-name">{s.name}</span>
                      </button>
                    ))}

                    {!spotLoading && !spotErr && spotQuery.trim().length >= 2 && spotResults.length === 0 ? (
                      <div style={{ textAlign: "center", opacity: 0.7, fontWeight: 700, padding: "8px 0" }}>
                        No results. Try another search.
                      </div>
                    ) : null}

                    {spotQuery.trim().length < 2 ? (
                      <div style={{ textAlign: "center", opacity: 0.7, fontWeight: 700, padding: "8px 0" }}>
                        Type at least 2 characters to search.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SPOT DETAILS MODAL
         ========================= */}
      {showSpotDetail && spotDraft && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={closeSpotDetail}>
          <div className="modal-card modal-spotDetail" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-topRow spotTopRow">
              <button className="modal-back" type="button" onClick={closeSpotDetail}>
                ←
              </button>

              <div className="modal-title">Add a spot</div>

              <div className="modal-spacer" />
            </div>

            <div className="spotDetail-body">
              <div className="spotDetail-card">
                <div className="spotDetail-left">
                  <label className="spotDetail-photo">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0] || null;
                        setSpotPhotoFile(f);
                        if (f) {
                          if (f.size > 2 * 1024 * 1024) return;
                          const b64 = await fileToBase64(f);
                          setSpotPhotoPreview(b64);
                        } else {
                          setSpotPhotoPreview("");
                        }
                      }}
                      style={{ display: "none" }}
                    />

                    {spotPhotoPreview ? (
                      <img src={spotPhotoPreview} alt="" />
                    ) : (
                      <div className="spotDetail-photoPlaceholder">
                        <div className="spotDetail-photoIcon">📷</div>
                        <div>Add a photo</div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="spotDetail-right">
                  <div className="spotDetail-name">{spotDraft.name}</div>

                  <textarea
                    className="spotDetail-note"
                    value={spotNote}
                    onChange={(e) => setSpotNote(e.target.value)}
                    placeholder="How was your experience?"
                  />

                  <div className="spotDetail-actions">
                    {editingSpotId ? (
                      <button className="spotDetail-remove" type="button" onClick={removeSpot}>
                        Remove spot
                      </button>
                    ) : null}

                    <button className="spotDetail-save" type="button" onClick={saveSpotDetail}>
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DELETE CONFIRM MODAL
         ========================= */}
      {showDeleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={() => setShowDeleteConfirm(false)}>
          <div className="confirm-card" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Are you sure you want to delete this trip?</h2>

            <div className="confirm-actions">
              <button className="confirm-yes" type="button" onClick={confirmDeleteTrip}>
                Yes
              </button>
              <button className="confirm-no" type="button" onClick={() => setShowDeleteConfirm(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
