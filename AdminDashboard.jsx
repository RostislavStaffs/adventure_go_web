import React, { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("token"), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [openId, setOpenId] = useState(null);
  const [openQuery, setOpenQuery] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const limit = 6;

  async function fetchList(nextPage = 1) {
    setLoading(true);
    setError("");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/queries?page=${nextPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load queries");
        setItems([]);
        setPages(1);
        setPage(1);
        setLoading(false);
        return;
      }

      setItems(data.items || []);
      setPage(data.page || nextPage);
      setPages(data.pages || 1);
      setLoading(false);
    } catch (e) {
      setError("Server not reachable");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOpen(id) {
    setOpenId(id);
    setOpenQuery(null);
    setModalError("");
    setModalLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.message || "Failed to load query");
        setModalLoading(false);
        return;
      }

      setOpenQuery(data.query);
      setModalLoading(false);
    } catch (e) {
      setModalError("Server not reachable");
      setModalLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this query?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/queries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      await fetchList(nextPage);
    } catch (e) {
      alert("Server not reachable");
    }
  }

  function closeModal() {
    setOpenId(null);
    setOpenQuery(null);
    setModalError("");
    setModalLoading(false);
  }

  function prevPage() {
    if (page <= 1) return;
    fetchList(page - 1);
  }

  function nextPage() {
    if (page >= pages) return;
    fetchList(page + 1);
  }

  return (
    <div className="adminPanel-page">
      <header className="adminPanel-topbar">
        <div className="adminPanel-topbarInner">
          <div className="adminPanel-brand">
            Adventure <span>GO</span>
          </div>

          <div className="adminPanel-title">Admin Panel</div>

          <nav className="adminPanel-links">
            <Link to="/admin/users" className="adminPanel-link">
              User List
            </Link>
            <Link to="/admin/account" className="adminPanel-link">
              Account
            </Link>
          </nav>
        </div>
      </header>

      <main className="adminPanel-main">
        <section className="adminPanel-shell">
          <div className="adminPanel-card">
            <h1 className="adminPanel-cardTitle">User Query List</h1>

            <div className="adminPanel-tableWrap">
              <div className="adminPanel-tableHeader">
                <div className="adminPanel-th">Query id</div>
                <div className="adminPanel-th">Email</div>
                <div className="adminPanel-th">Date</div>
                <div className="adminPanel-th adminPanel-thCenter">Action</div>
              </div>

              <div className="adminPanel-tableBody">
                {loading && <div className="adminPanel-empty">Loading...</div>}

                {!loading && error && (
                  <div className="adminPanel-empty">{error}</div>
                )}

                {!loading && !error && items.length === 0 && (
                  <div className="adminPanel-empty">No queries yet</div>
                )}

                {!loading &&
                  !error &&
                  items.map((q) => {
                    return (
                      <div className="adminPanel-row" key={q._id}>
                        <div className="adminPanel-td adminPanel-tdId">
                          {q.queryNumber}
                        </div>

                        <div className="adminPanel-td adminPanel-tdEmail">
                          {q.email}
                        </div>

                        <div className="adminPanel-td adminPanel-tdDate">
                          {formatDate(q.createdAt)}
                        </div>

                        <div className="adminPanel-td adminPanel-tdActions">
                          <button
                            className="adminPanel-actionBtn"
                            type="button"
                            onClick={() => handleOpen(q._id)}
                            aria-label="Open query"
                            title="Open"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                            >
                              <path
                                d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-.7-.7a2 2 0 0 0-2.8 0L4 16v4z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M13.5 6.5l4 4"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>

                          <button
                            className="adminPanel-actionBtn"
                            type="button"
                            onClick={() => handleDelete(q._id)}
                            aria-label="Delete query"
                            title="Delete"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                            >
                              <path
                                d="M6 7h12"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9 7V5.7A1.7 1.7 0 0 1 10.7 4h2.6A1.7 1.7 0 0 1 15 5.7V7"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 7l.6 13h6.8L16 7"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10.5 11v6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                              <path
                                d="M13.5 11v6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="adminPanel-pagination">
                <button
                  type="button"
                  className="adminPanel-pageBtn"
                  onClick={prevPage}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  title="Previous"
                >
                  <span className="adminPanel-arrow">‹</span>
                </button>

                <div className="adminPanel-pageDot" aria-hidden="true" />

                <button
                  type="button"
                  className="adminPanel-pageBtn"
                  onClick={nextPage}
                  disabled={page >= pages}
                  aria-label="Next page"
                  title="Next"
                >
                  <span className="adminPanel-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {openId && (
        <div className="adminPanel-modalOverlay" onMouseDown={closeModal}>
          <div
            className="adminPanel-modal"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="adminPanel-modalTop">
              <div className="adminPanel-modalTitle">Query</div>
              <button
                type="button"
                className="adminPanel-modalClose"
                onClick={closeModal}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>

            {modalLoading && (
              <div className="adminPanel-modalBody">Loading...</div>
            )}

            {!modalLoading && modalError && (
              <div className="adminPanel-modalBody">{modalError}</div>
            )}

            {!modalLoading && !modalError && openQuery && (
              <div className="adminPanel-modalBody">
                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">Query id</div>
                  <div className="adminPanel-modalValue">
                    {openQuery.queryNumber}
                  </div>
                </div>

                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">First name</div>
                  <div className="adminPanel-modalValue">
                    {openQuery.firstName || "-"}
                  </div>
                </div>

                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">Last name</div>
                  <div className="adminPanel-modalValue">
                    {openQuery.lastName || "-"}
                  </div>
                </div>

                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">Email</div>
                  <div className="adminPanel-modalValue">{openQuery.email}</div>
                </div>

                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">Phone</div>
                  <div className="adminPanel-modalValue">
                    {openQuery.phone || "-"}
                  </div>
                </div>

                <div className="adminPanel-modalRow">
                  <div className="adminPanel-modalLabel">Date</div>
                  <div className="adminPanel-modalValue">
                    {formatDate(openQuery.createdAt)}
                  </div>
                </div>

                <div className="adminPanel-modalRow adminPanel-modalRowMessage">
                  <div className="adminPanel-modalLabel">Message</div>
                  <div className="adminPanel-modalValue adminPanel-modalMessageBox">
                    {openQuery.message || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
