/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export const DashboardHome = () => {
  const { user } = useAuth();
  const role = user?.role;

  // 1. ADMIN VIEW
  if (role === "ADMIN" || role === "SUPERADMIN") {
    return (
      <div style={styles.grid}>
        <StatCard
          title="Pending Verifications"
          value="12"
          link="/dashboard/admin/users"
          color="#ecc94b"
        />
        <StatCard
          title="Active RFPs"
          value="45"
          link="/dashboard/rfps"
          color="#4299e1"
        />
        <StatCard
          title="Total Users"
          value="120"
          link="/dashboard/admin/users"
          color="#48bb78"
        />
        <div style={styles.wideCard}>
          <h3>System Overview</h3>
          <p>
            Quick Access: <Link to="/dashboard/admin/users">Manage Users</Link>{" "}
            | <Link to="/dashboard/profile">Audit Logs</Link>
          </p>
        </div>
      </div>
    );
  }

  // 2. SUPPLIER VIEW
  if (role === "SUPPLIER") {
    const isPending = user?.supplier?.status === "PENDING";
    return (
      <div style={styles.container}>
        <header style={styles.welcome}>
          <h2>Welcome back, {user?.firstName}! 👋</h2>
          {isPending ? (
            <div style={styles.warningBox}>
              <p>
                ⚠️ Your account is currently{" "}
                <strong>Pending Verification</strong>. You can browse RFPs but
                cannot place bids yet.
              </p>
              <Link to="/dashboard/onboarding">Complete your profile</Link>
            </div>
          ) : (
            <p style={{ color: "#48bb78" }}>
              ✅ Your account is verified and active.
            </p>
          )}
        </header>
        <div style={styles.grid}>
          <StatCard
            title="My Active Bids"
            value="4"
            link="/dashboard/my-bids"
            color="#4299e1"
          />
          <StatCard
            title="New RFPs Today"
            value="8"
            link="/dashboard/rfps"
            color="#9f7aea"
          />
        </div>
      </div>
    );
  }

  // 3. BUYER VIEW
  if (role === "BUYER") {
    return (
      <div style={styles.container}>
        <header style={styles.welcome}>
          <h2>{user?.buyer?.companyName || "Buyer Console"}</h2>
          <p>Manage your procurement requests and evaluate suppliers.</p>
        </header>
        <div style={styles.grid}>
          <StatCard
            title="My Open RFPs"
            value="3"
            link="/dashboard/rfps"
            color="#48bb78"
          />
          <StatCard
            title="Total Bids Received"
            value="28"
            link="/dashboard/rfps"
            color="#4299e1"
          />
          <Link to="/dashboard/rfps/create" style={styles.createBtn}>
            + Create New RFP
          </Link>
        </div>
      </div>
    );
  }

  return <div>Loading Dashboard...</div>;
};

// --- Sub-Components ---
const StatCard = ({ title, value, link, color }: any) => (
  <Link to={link} style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <span style={styles.cardTitle}>{title}</span>
    <span style={styles.cardValue}>{value}</span>
  </Link>
);

const styles: { [key: string]: React.CSSProperties } = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: "14px",
    color: "#718096",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  cardValue: { fontSize: "32px", fontWeight: "800", color: "#2d3748" },
  warningBox: {
    backgroundColor: "#fffaf0",
    border: "1px solid #feebc8",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3182ce",
    color: "#fff",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
