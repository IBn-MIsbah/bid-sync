import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div style={styles.container}>
      {/* GRID OVERLAY FOR TECH LOOK */}
      <div style={styles.gridOverlay} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          KAF <span style={{ color: "#3182ce" }}>PORTAL</span>
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.loginBtn}>
            LOGIN
          </Link>
          <Link to="/register" style={styles.registerBtn}>
            JOIN PLATFORM
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main style={styles.hero}>
        <div style={styles.badge}>v1.0.0 STABLE RELEASE</div>
        <h1 style={styles.title}>
          NEXT-GEN <br />
          <span style={styles.gradientText}>PROCUREMENT</span> <br />
          INFRASTRUCTURE
        </h1>
        <p style={styles.subtitle}>
          Secure, transparent, and real-time bidding for modern supply chains.
          Connecting verified suppliers with high-value RFPs through automated
          workflows.
        </p>

        <div style={styles.ctaContainer}>
          <Link to="/register" style={styles.primaryCta}>
            START ONBOARDING <span style={{ marginLeft: "10px" }}>&rarr;</span>
          </Link>
          <div style={styles.secondaryCta}>
            <span style={{ color: "#3182ce" }}>●</span> SYSTEM STATUS:
            OPERATIONAL
          </div>
        </div>
      </main>

      {/* FEATURES / STATS BOX */}
      <section style={styles.statsSection}>
        <div style={styles.statBox}>
          <div style={styles.statVal}>REAL-TIME</div>
          <div style={styles.statLabel}>Socket.io Sync</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statVal}>VERIFIED</div>
          <div style={styles.statLabel}>Supplier Audits</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statVal}>ENCRYPTED</div>
          <div style={styles.statLabel}>Document Security</div>
        </div>
      </section>

      <footer style={styles.footer}>
        © 2026 KAF SYSTEMS. COORDINATED BIDDING & TRANSPARENCY PLATFORM.
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#020617", // Deep Navy
    color: "#fff",
    fontFamily: "'JetBrains Mono', monospace",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    opacity: 0.2,
    pointerEvents: "none",
  },
  nav: {
    height: "80px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 5%",
    borderBottom: "1px solid #1e293b",
    zIndex: 10,
    backdropFilter: "blur(10px)",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "900",
    letterSpacing: "2px",
  },
  navLinks: { display: "flex", gap: "20px" },
  loginBtn: {
    textDecoration: "none",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "10px 20px",
  },
  registerBtn: {
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#3182ce",
    fontSize: "12px",
    fontWeight: "700",
    padding: "10px 20px",
    border: "1px solid #63b3ed",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 10%",
    zIndex: 10,
  },
  badge: {
    fontSize: "10px",
    border: "1px solid #3182ce",
    padding: "4px 12px",
    borderRadius: "20px",
    color: "#63b3ed",
    marginBottom: "24px",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "clamp(40px, 8vw, 80px)",
    fontWeight: "900",
    lineHeight: 1,
    margin: "0 0 24px 0",
    letterSpacing: "-2px",
  },
  gradientText: {
    color: "#3182ce",
    textShadow: "0 0 30px rgba(49, 130, 206, 0.3)",
  },
  subtitle: {
    maxWidth: "600px",
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#94a3b8",
    marginBottom: "40px",
  },
  ctaContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },
  primaryCta: {
    textDecoration: "none",
    backgroundColor: "#fff",
    color: "#020617",
    padding: "18px 40px",
    fontSize: "14px",
    fontWeight: "900",
    letterSpacing: "1px",
    transition: "transform 0.2s ease",
  },
  secondaryCta: {
    fontSize: "10px",
    color: "#475569",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  statsSection: {
    display: "flex",
    borderTop: "1px solid #1e293b",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  statBox: {
    flex: 1,
    padding: "40px",
    borderRight: "1px solid #1e293b",
    textAlign: "center",
  },
  statVal: {
    fontSize: "18px",
    fontWeight: "900",
    color: "#fff",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  footer: {
    padding: "20px",
    textAlign: "center",
    fontSize: "9px",
    color: "#334155",
    letterSpacing: "1px",
  },
};
