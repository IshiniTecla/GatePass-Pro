import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner"; // Adjust path if needed

function VisitationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVisitationHistory = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch("http://localhost:5000/api/meetings/history", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else {
          console.error("Failed to fetch visitation history");
        }
      } catch (err) {
        console.error("Error fetching visitation history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitationHistory();
  }, []);

  const filteredHistory = history.filter((visit) => {
    const matchesFilter = filter === "all" || visit.status.toLowerCase() === filter;
    const matchesSearch =
      visit.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.location && visit.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <LoadingSpinner />;

  const styles = {
    container: {
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    filterButtons: {
      display: "flex",
      gap: "10px",
    },
    filterButton: (isActive) => ({
      padding: "8px 16px",
      border: "1px solid #007bff",
      backgroundColor: isActive ? "#007bff" : "#fff",
      color: isActive ? "#fff" : "#007bff",
      borderRadius: "4px",
      cursor: "pointer",
    }),
    searchInput: {
      padding: "8px",
      width: "250px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: "#f8f9fa",
      padding: "12px",
      textAlign: "left",
      borderBottom: "1px solid #ddd",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    badge: (status) => ({
      padding: "5px 10px",
      borderRadius: "12px",
      backgroundColor:
        status === "completed" ? "#28a745" :
          status === "upcoming" ? "#17a2b8" :
            status === "cancelled" ? "#dc3545" : "#6c757d",
      color: "#fff",
      fontSize: "0.9rem",
    }),
    pagination: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
      marginTop: "20px",
    },
    paginationButton: (active) => ({
      padding: "6px 12px",
      backgroundColor: active ? "#007bff" : "#fff",
      border: "1px solid #007bff",
      borderRadius: "4px",
      color: active ? "#fff" : "#007bff",
      cursor: "pointer",
    }),
    actionButtons: {
      display: "flex",
      gap: "10px",
    },
    emptyState: {
      textAlign: "center",
      marginTop: "40px",
      color: "#888",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Your Visitation History</h2>
        <input
          type="text"
          placeholder="Search by host, purpose, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      <div style={styles.filterButtons}>
        {["all", "completed", "upcoming", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={styles.filterButton(filter === status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredHistory.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No visitation records found. Your meeting history will appear here.</p>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Host</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((visit) => (
                <tr key={visit._id}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={visit.hostAvatar || "https://via.placeholder.com/40"}
                        alt={visit.hostName}
                        style={styles.avatar}
                      />
                      {visit.hostName}
                    </div>
                  </td>
                  <td style={styles.td}>{formatDate(visit.scheduledTime)}</td>
                  <td style={styles.td}>{visit.purpose}</td>
                  <td style={styles.td}>{visit.location || "Virtual"}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(visit.status.toLowerCase())}>
                      {visit.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button className="btn btn-outline-primary btn-sm">View Details</button>
                      {visit.status === "upcoming" && (
                        <button className="btn btn-outline-danger btn-sm">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={styles.paginationButton(false)}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  style={styles.paginationButton(currentPage === i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={styles.paginationButton(false)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VisitationHistory;
