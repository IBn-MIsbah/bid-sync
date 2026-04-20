import React, { useEffect, useState } from "react";
import { getAllUsers } from "../services/api/admin-api";
import { Link } from "react-router-dom";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "BUYER" | "SUPPLIER" | "ADMIN" | "SUPERADMIN";
  supplier?: {
    id: string;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    businessName: string;
  };
  buyer?: {
    companyName: string;
  };
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return u.supplier?.status === "PENDING";
    return u.role === filter;
  });

  const getRoleColor = (role: string) => {
    const colors = {
      SUPERADMIN: "#e9d8fd",
      ADMIN: "#fed7d7",
      SUPPLIER: "#bee3f8",
      BUYER: "#c6f6d5",
    };
    return colors[role as keyof typeof colors] || "#edf2f7";
  };

  if (loading)
    return <div style={styles.loader}>Gathering platform data...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <p style={{ color: "#718096", fontSize: "14px" }}>
            Manage accounts and verify identities
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">All Users</option>
          <option value="PENDING">Pending Verification</option>
          <option value="SUPPLIER">Suppliers</option>
          <option value="BUYER">Buyers</option>
        </select>
      </header>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Organization</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={styles.tbodyRow}>
                <td style={styles.td}>
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getRoleColor(user.role),
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {user.role === "SUPPLIER"
                    ? user.supplier?.businessName
                    : user.buyer?.companyName || "-"}
                </td>
                <td style={styles.td}>
                  {user.role === "SUPPLIER" ? (
                    <span
                      style={{
                        fontWeight: "600",
                        color:
                          user.supplier?.status === "VERIFIED"
                            ? "#38a169"
                            : "#dd6b20",
                      }}
                    >
                      {user.supplier?.status}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td style={styles.td}>
                  <Link
                    to={`/dashboard/admin/users/${user.id}`}
                    style={styles.reviewBtn}
                  >
                    {user.supplier?.status === "PENDING"
                      ? "Review & Verify"
                      : "View Profile"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "1.5rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2rem",
  },
  select: { padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { textAlign: "left", borderBottom: "2px solid #edf2f7" },
  th: {
    padding: "12px",
    color: "#718096",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  tbodyRow: { borderBottom: "1px solid #edf2f7" },
  td: { padding: "15px", fontSize: "14px" },
  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  reviewBtn: {
    color: "#3182ce",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "13px",
  },
  loader: { textAlign: "center", padding: "50px" },
};
