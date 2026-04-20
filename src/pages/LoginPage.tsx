/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/auth/Login/LoginForm";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { LoginInput } from "../schemas/auth-schema";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated } = useAuth();

  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (loginData: LoginInput) => {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      await login(loginData);
      const origin = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(origin);
      setMessage("AUTH_SUCCESS: REDIRECTING...");
    } catch (err: any) {
      const errorMessage =
        typeof err === "string" ? err : err.message || "INVALID_CREDENTIALS";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Visual background sync with Landing Page */}
      <div style={styles.gridOverlay} />

      <div style={styles.authWrapper}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>K</div>
          <span style={styles.logoText}>
            KAF <span style={{ color: "#3182ce" }}>PORTAL</span>
          </span>
        </div>

        <div style={styles.authCard}>
          <div style={styles.cardHeader}>
            <span style={{ color: "#3182ce" }}>//</span> SECURE_GATEWAY_v1.0
          </div>

          <div style={styles.formPadding}>
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isSubmitting}
              error={error}
              message={message}
            />
          </div>

          <div style={styles.cardFooter}>
            <span style={{ color: "#475569" }}>NEW_OPERATOR?</span>
            <Link to="/register" style={styles.link}>
              REQUEST_ACCESS
            </Link>
          </div>
        </div>

        <Link to="/" style={styles.backLink}>
          &larr; TERMINATE_TO_ROOT
        </Link>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    position: "relative",
    color: "#fff",
    padding: "20px",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    opacity: 0.1,
    pointerEvents: "none",
  },
  authWrapper: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 10,
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#3182ce",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "20px",
  },
  logoText: {
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "2px",
  },
  authCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    border: "2px solid #1e293b",
    boxShadow: "20px 20px 0px #0f172a",
  },
  cardHeader: {
    padding: "15px 20px",
    borderBottom: "1px solid #1e293b",
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: "1px",
    backgroundColor: "rgba(30, 41, 59, 0.3)",
  },
  formPadding: {
    padding: "30px",
  },
  cardFooter: {
    padding: "20px",
    borderTop: "1px solid #1e293b",
    textAlign: "center",
    fontSize: "11px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  link: {
    color: "#3182ce",
    textDecoration: "none",
    fontWeight: "900",
  },
  backLink: {
    marginTop: "30px",
    color: "#475569",
    textDecoration: "none",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
};

export default LoginPage;
