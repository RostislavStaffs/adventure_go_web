import React, { useEffect, useMemo, useState } from "react";
import "./UserListPage.css";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";

export default function UserListPage() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 6;

  async function fetchUsers(nextPage = 1) {
    setLoading(true);
    setError("");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users?page=${nextPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load users");
        setUsers([]);
        setPages(1);
        setPage(1);
        setLoading(false);
        return;
      }

      setUsers(data.items || []);
      setPage(data.page || nextPage);
      setPages(data.pages || 1);
      setLoading(false);
    } catch {
      setError("Server not reachable");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function prevPage() {
    if (page <= 1) return;
    fetchUsers(page - 1);
  }

  function nextPage() {
    if (page >= pages) return;
    fetchUsers(page + 1);
  }

  function handleResetPassword(user) {
    alert(`Reset password requested for ${user.email}`);
  }

  function handleDelete(user) {
    if (!window.confirm(`Delete ${user.email}?`)) return;
    alert("Delete user (to be implemented)");
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
            <Link to="/admin/dashboard" className="adminPanel-link">
              Queries
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
            <div className="adminPanel-backRow">
              <button
                className="adminPanel-backBtn"
                onClick={() => navigate("/admin/dashboard")}
              >
                ←
              </button>
            </div>

            <h1 className="adminPanel-cardTitle">User List</h1>

            <div className="adminPanel-tableWrap">
              <div className="adminPanel-tableHeader">
                <div className="adminPanel-th">User id</div>
                <div className="adminPanel-th">Email</div>
                <div className="adminPanel-th">Phone Number</div>
                <div className="adminPanel-th adminPanel-thCenter">Action</div>
              </div>

              <div className="adminPanel-tableBody">
                {loading && (
                  <div className="adminPanel-empty">Loading...</div>
                )}

                {!loading && error && (
                  <div className="adminPanel-empty">{error}</div>
                )}

                {!loading && !error && users.length === 0 && (
                  <div className="adminPanel-empty">No users found</div>
                )}

                {!loading &&
                  !error &&
                  users.map((u, idx) => {
                    const userNumber = (page - 1) * limit + (idx + 1);
                    return (
                      <div className="adminPanel-row" key={u._id}>
                        <div className="adminPanel-td adminPanel-tdId">
                          {userNumber}
                        </div>

                        <div className="adminPanel-td adminPanel-tdEmail">
                          {u.email}
                        </div>

                        <div className="adminPanel-td adminPanel-tdPhone">
                          {u.phone || "-"}
                        </div>

                        <div className="adminPanel-td adminPanel-tdActions">
                          <button
                            className="adminPanel-actionBtn"
                            onClick={() => handleResetPassword(u)}
                            title="Reset password"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                            >
                              <path
                                d="M4 4v6h6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                              <path
                                d="M20 20v-6h-6"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                              <path
                                d="M20 9a8 8 0 0 0-14-3"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                              <path
                                d="M4 15a8 8 0 0 0 14 3"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>

                          <button
                            className="adminPanel-actionBtn"
                            onClick={() => handleDelete(u)}
                            title="Delete user"
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
                              />
                              <path
                                d="M8 7l.6 13h6.8L16 7"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
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
                  className="adminPanel-pageBtn"
                  onClick={prevPage}
                  disabled={page <= 1}
                >
                  ‹
                </button>

                <div className="adminPanel-pageDot" />

                <button
                  className="adminPanel-pageBtn"
                  onClick={nextPage}
                  disabled={page >= pages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
