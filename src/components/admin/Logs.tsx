/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getActivityLogs, type LogFilters } from "../../services/api/admin-api";

const AdminLogDashboard: React.FC = () => {
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    page: 1,
    limit: 15,
    logType: "activity",
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "#38A169";
    if (action.includes("DELETE") || action.includes("ERROR")) return "#E53E3E";
    if (action.includes("UPDATE")) return "#3182CE";
    return "#718096";
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Audit & System Logs</h2>
            <p style={styles.subtitle}>
              Monitor user activities and system health across the platform
            </p>
          </div>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Logs</span>
              <span style={styles.statValue}>
                {logs?.pagination?.total || 0}
              </span>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <div style={styles.filterBar}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Log Category</label>
            <select
              style={styles.select}
              value={filters.logType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  logType: e.target.value as any,
                  page: 1,
                })
              }
            >
              <option value="activity">User Activity</option>
              <option value="system">System Events</option>
            </select>
          </div>

          {filters.logType === "system" && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Severity Level</label>
              <select
                style={styles.select}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    level: e.target.value as any,
                    page: 1,
                  })
                }
              >
                <option value="">All Levels</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>From Date</label>
            <input
              type="date"
              style={styles.select}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value, page: 1 })
              }
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div style={styles.tableWrapper}>
          {loading ? (
            <div style={styles.loadingArea}>Refreshing logs...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Identifier</th>
                  <th style={styles.th}>
                    {filters.logType === "activity" ? "User" : "Level"}
                  </th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filters.logType === "activity"
                  ? logs?.activityLogs?.map((log: any) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.tdTime}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.actionBadge,
                              color: getActionColor(log.action),
                              borderColor: getActionColor(log.action),
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={styles.tdUser}>
                          <strong>
                            {log.user?.firstName} {log.user?.lastName}
                          </strong>
                          <div style={styles.emailText}>{log.user?.email}</div>
                        </td>
                        <td style={styles.td}>
                          <pre style={styles.jsonBox}>
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))
                  : logs?.systemLogs?.map((log: any) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.tdTime}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <strong>{log.context}</strong>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.levelBadge,
                              ...levelStyles[log.level],
                            }}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td style={styles.tdMessage}>{log.message}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <footer style={styles.pagination}>
          <button
            style={{ ...styles.pageBtn, opacity: filters.page === 1 ? 0.5 : 1 }}
            disabled={filters.page === 1}
            onClick={() =>
              setFilters({ ...filters, page: (filters.page || 1) - 1 })
            }
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page <strong>{filters.page}</strong> of{" "}
            {logs?.pagination?.totalPages || 1}
          </span>
          <button
            style={{
              ...styles.pageBtn,
              opacity: filters.page === logs?.pagination?.totalPages ? 0.5 : 1,
            }}
            disabled={filters.page === logs?.pagination?.totalPages}
            onClick={() =>
              setFilters({ ...filters, page: (filters.page || 1) + 1 })
            }
          >
            Next
          </button>
        </footer>
      </div>
    </div>
  );
};

const levelStyles: any = {
  INFO: { backgroundColor: "#EBF8FF", color: "#2B6CB0" },
  WARN: { backgroundColor: "#FEFCBF", color: "#B7791F" },
  ERROR: { backgroundColor: "#FFF5F5", color: "#C53030" },
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    backgroundColor: "#F7FAFC",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  header: {
    padding: "30px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { margin: 0, fontSize: "1.5rem", color: "#1A202C" },
  subtitle: { margin: "5px 0 0", color: "#718096", fontSize: "0.9rem" },
  stats: { textAlign: "right" },
  statItem: {
    backgroundColor: "#EDF2F7",
    padding: "10px 20px",
    borderRadius: "8px",
  },
  statLabel: {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    color: "#4A5568",
    fontWeight: "bold",
  },
  statValue: { fontSize: "1.2rem", fontWeight: "bold", color: "#2D3748" },
  filterBar: {
    padding: "20px 30px",
    backgroundColor: "#F8FAFC",
    display: "flex",
    gap: "20px",
    borderBottom: "1px solid #E2E8F0",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "0.75rem",
    fontWeight: "bold",
    color: "#4A5568",
    textTransform: "uppercase",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #CBD5E0",
    backgroundColor: "#fff",
    color: "#2D3748",
    fontSize: "0.9rem",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    padding: "15px 30px",
    backgroundColor: "#F1F5F9",
    color: "#475569",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  tr: { borderBottom: "1px solid #EDF2F7" },
  td: {
    padding: "15px 30px",
    verticalAlign: "top",
    fontSize: "0.9rem",
    color: "#2D3748",
  },
  tdTime: {
    padding: "15px 30px",
    fontSize: "0.85rem",
    color: "#718096",
    width: "180px",
  },
  tdUser: { padding: "15px 30px", width: "250px" },
  emailText: { fontSize: "0.8rem", color: "#718096" },
  actionBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    border: "1px solid",
  },
  levelBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: "bold",
  },
  jsonBox: {
    margin: 0,
    padding: "10px",
    backgroundColor: "#F7FAFC",
    borderRadius: "6px",
    fontSize: "0.8rem",
    color: "#4A5568",
    border: "1px solid #E2E8F0",
    whiteSpace: "pre-wrap",
  },
  tdMessage: { padding: "15px 30px", color: "#2D3748", lineHeight: "1.5" },
  pagination: {
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #E2E8F0",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  pageInfo: { fontSize: "0.9rem", color: "#4A5568" },
  loadingArea: {
    padding: "50px",
    textAlign: "center",
    color: "#718096",
    fontStyle: "italic",
  },
};

export default AdminLogDashboard;
