/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Navigate,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { getMe } from "../services/api/auth-api";
import {
  getNotification,
  updateIsRead,
  clearNotifications,
} from "../services/api/notification-api";

// Aligned with Prisma & API Response
interface NotificationItem {
  id: string;
  userId: string;
  content: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE MANAGEMENT ---
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; content: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getNotification();
        if (response.status) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error("Critical: Failed to load notification stream", err);
      }
    };

    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket) return;

    socket.on("force_logout", () => handleLogout());

    socket.on("new_notification", (notif: NotificationItem) => {
      const toastId = Date.now();
      setNotifications((prev) => [notif, ...prev]);
      setToasts((prev) => [{ id: toastId, content: notif.content }, ...prev]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 6000);
    });

    socket.on("new_message", () => {
      if (!location.pathname.includes("/chat")) {
        setHasNewMessage(true);
      }
    });

    socket.on("profile_sync", (data) => {
      const toastId = Date.now();
      setToasts((prev) => [
        { id: toastId, content: `DATA_SYNC: ${data.status}` },
        ...prev,
      ]);
      getMe().catch(() => {});
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 6000);
    });

    return () => {
      socket.off("force_logout");
      socket.off("new_notification");
      socket.off("new_message");
      socket.off("profile_sync");
    };
  }, [socket, location.pathname]);

  // --- PERSISTENCE LOGIC ---
  const handleMarkAsRead = async (id: string) => {
    // 1. Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

    // 2. Server Sync
    try {
      await updateIsRead(id);
    } catch (err) {
      console.error("Failed to sync read status", err);
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic UI Update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Server Sync (Sequential or Parallel depending on your API)
    try {
      await Promise.all(unreadIds.map((id) => updateIsRead(id)));
    } catch (err) {
      console.error("Batch update failed", err);
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: unreadIds.includes(n.id) ? false : n.isRead,
        })),
      );
    }
  };

  const handleClearAllNotifications = async () => {
    if (notifications.length === 0) return;

    setIsClearing(true);
    try {
      await clearNotifications();
      // Optimistic UI Update - Clear all notifications
      setNotifications([]);
      // Show success toast
      const toastId = Date.now();
      setToasts((prev) => [
        { id: toastId, content: "All notifications cleared successfully" },
        ...prev,
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3000);
    } catch (err) {
      console.error("Failed to clear notifications", err);
      // Show error toast
      const toastId = Date.now();
      setToasts((prev) => [
        { id: toastId, content: "Failed to clear notifications" },
        ...prev,
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div style={styles.loadingOverlay}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>SYNCHRONIZING_CORE_RESOURCES...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const role = user?.role;
  const isPending = role === "SUPPLIER" && user?.supplier?.status === "PENDING";

  return (
    <div style={styles.layoutContainer}>
      {showPanel && (
        <div onClick={() => setShowPanel(false)} style={styles.overlay} />
      )}

      {/* TOAST SYSTEM */}
      <div style={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} style={styles.toast}>
            <div style={styles.toastAccent} />
            <div style={styles.toastBody}>
              <span style={{ fontSize: "14px" }}>🛰️</span>
              <span>{t.content}</span>
            </div>
          </div>
        ))}
      </div>

      {/* NOTIFICATION DRAWER */}
      <div
        ref={panelRef}
        style={{
          ...styles.slidingPanel,
          transform: showPanel ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div style={styles.panelHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "900" }}>
              SYSTEM_LOGS
            </h3>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              {unreadCount} PENDING_ALERTS | {notifications.length} TOTAL
            </span>
          </div>
          <button onClick={() => setShowPanel(false)} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div style={styles.panelList}>
          {notifications.length === 0 ? (
            <div style={styles.emptyNotif}>NO_DATA_STREAM</div>
          ) : (
            notifications.map((n) => {
              const isUrgent = n.type === "VERIFICATION_REQUEST";
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  style={{
                    ...styles.notifCard,
                    backgroundColor: n.isRead
                      ? "transparent"
                      : "rgba(49, 130, 206, 0.03)",
                    borderLeft: n.isRead
                      ? "4px solid #334155"
                      : `4px solid ${isUrgent ? "#f87171" : "#3b82f6"}`,
                    cursor: n.isRead ? "default" : "pointer",
                  }}
                >
                  {n.link ? (
                    <Link to={n.link} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          ...styles.notifType,
                          color: isUrgent ? "#f87171" : "#3b82f6",
                        }}
                      >
                        {n.type.replace(/_/g, " ")}
                      </div>
                      <div style={styles.notifContent}>{n.content}</div>
                      <div style={styles.notifTime}>
                        {new Date(n.createdAt).toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div
                        style={{
                          ...styles.notifType,
                          color: isUrgent ? "#f87171" : "#3b82f6",
                        }}
                      >
                        {n.type.replace(/_/g, " ")}
                      </div>
                      <div style={styles.notifContent}>{n.content}</div>
                      <div style={styles.notifTime}>
                        {new Date(n.createdAt).toLocaleString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div style={styles.panelFooter}>
          <button
            style={styles.archiveBtn}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            ARCHIVE_ALL_EVENTS
          </button>
          <button
            style={styles.clearBtn}
            onClick={handleClearAllNotifications}
            disabled={notifications.length === 0 || isClearing}
          >
            {isClearing ? "CLEARING..." : "CLEAR_ALL_NOTIFICATIONS"}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <h2 style={styles.logoText}>
            KAF <span style={{ color: "#fff" }}>PORTAL</span>
          </h2>
        </div>
        <nav style={styles.navLinks}>
          <SidebarLink
            to="/dashboard/"
            label="COMMAND_CENTER"
            active={location.pathname === "/dashboard"}
          />

          {role === "SUPPLIER" && (
            <>
              <SidebarLink
                to="/dashboard/rfps"
                label="OPEN_RFPS"
                active={location.pathname === "/dashboard/rfps"}
              />
              <SidebarLink
                to="/dashboard/chat"
                label={hasNewMessage ? "COMMS_LINK (ALIVE)" : "COMMS_LINK"}
                active={location.pathname === "/dashboard/chat"}
                onClick={() => setHasNewMessage(false)}
              />
              <SidebarLink
                to="/dashboard/onboarding"
                label={isPending ? "VERIFICATION_REQUIRED" : "SECURITY_DOCS"}
                active={location.pathname === "/dashboard/onboarding"}
                color={isPending ? "#fbbf24" : undefined}
              />
            </>
          )}

          {(role === "ADMIN" || role === "SUPERADMIN") && (
            <>
              <div style={styles.navHeader}>Admin Protocol</div>
              <SidebarLink
                to="/dashboard/admin/users"
                label="USER_DIRECTORY"
                active={location.pathname.includes("/admin/users")}
              />
              <SidebarLink
                to="/dashboard/admin/logs"
                label="SYSTEM_AUDIT"
                active={location.pathname.includes("/admin/logs")}
              />
            </>
          )}

          <div style={styles.navHeader}>Operator</div>
          <SidebarLink
            to="/dashboard/profile"
            label="IDENT_PROFILE"
            active={location.pathname === "/dashboard/profile"}
          />
        </nav>
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
            TERMINATE_SESSION
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.mainContent}>
        {isPending && !location.pathname.includes("onboarding") && (
          <div style={styles.alertBanner}>
            <span>
              ⚠️ <strong>PROTOCOL_BLOCK:</strong> Upload verification documents
              to enable full operations.
            </span>
            <Link to="/dashboard/onboarding" style={styles.alertLink}>
              INIT_UPLOAD &rarr;
            </Link>
          </div>
        )}

        <header style={styles.topNav}>
          <div style={styles.breadcrumb}>
            <span style={{ color: "#64748b", fontSize: "10px" }}>
              KAF_SYSTEM /{" "}
            </span>
            <span style={styles.breadcrumbActive}>
              {location.pathname.split("/").pop()?.toUpperCase() || "HOME"}
            </span>
          </div>

          <div style={styles.userSection}>
            <button
              onClick={() => setShowPanel(true)}
              style={styles.notifBadgeBtn}
            >
              ⚡{" "}
              {unreadCount > 0 && (
                <span style={styles.badgeCount}>{unreadCount}</span>
              )}
            </button>
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </span>
              <span style={styles.userRoleBadge}>{role}</span>
            </div>
            <div style={styles.avatar}>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
          </div>
        </header>

        <div style={styles.pageBody}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- SUBSIDIARY COMPONENTS ---
const SidebarLink = ({ to, label, active, color, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.navItem,
        backgroundColor: active
          ? "#3182ce"
          : isHovered
            ? "#1e293b"
            : "transparent",
        color: color || (active ? "#fff" : "#64748b"),
        borderLeft: active ? "4px solid #60a5fa" : "4px solid transparent",
      }}
    >
      {label}
    </Link>
  );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f1f5f9",
    fontFamily: "'JetBrains Mono', monospace",
    overflow: "hidden",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#020617",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },
  logoSection: { padding: "2rem 1.5rem", borderBottom: "1px solid #1e293b" },
  logoText: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "900",
    color: "#3b82f6",
    letterSpacing: "1px",
  },
  navHeader: {
    fontSize: "9px",
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "1.5rem 0 0.5rem 1.5rem",
  },
  navLinks: {
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  navItem: {
    textDecoration: "none",
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: "700",
    transition: "0.1s",
    display: "flex",
    alignItems: "center",
  },
  sidebarFooter: {
    padding: "1rem",
    backgroundColor: "#020617",
    borderTop: "1px solid #1e293b",
  },
  logoutBtnSidebar: {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    fontSize: "9px",
    fontWeight: "900",
    cursor: "pointer",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  topNav: {
    height: "64px",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    borderBottom: "1px solid #e2e8f0",
  },
  breadcrumbActive: { fontWeight: "900", color: "#0f172a", fontSize: "10px" },
  userSection: { display: "flex", alignItems: "center", gap: "15px" },
  userInfo: { display: "flex", flexDirection: "column", textAlign: "right" },
  userName: { fontWeight: "900", color: "#0f172a", fontSize: "12px" },
  userRoleBadge: { fontSize: "8px", color: "#3b82f6", fontWeight: "900" },
  avatar: {
    width: "34px",
    height: "34px",
    backgroundColor: "#0f172a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "11px",
    borderRadius: "4px",
  },
  pageBody: { padding: "1.5rem", flex: 1 },
  toastContainer: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  toast: {
    backgroundColor: "#0f172a",
    color: "#fff",
    minWidth: "280px",
    border: "1px solid #334155",
    display: "flex",
    boxShadow: "8px 8px 0px rgba(0,0,0,0.1)",
  },
  toastAccent: { width: "4px", backgroundColor: "#3b82f6" },
  toastBody: {
    padding: "12px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "700",
  },
  alertBanner: {
    backgroundColor: "#fff1f2",
    borderBottom: "1px solid #fda4af",
    color: "#be123c",
    padding: "10px 2rem",
    fontSize: "10px",
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "700",
  },
  alertLink: {
    color: "#be123c",
    fontWeight: "900",
    textDecoration: "underline",
  },
  loadingOverlay: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#3b82f6",
    fontWeight: "900",
    fontSize: "11px",
    marginTop: "15px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #1e293b",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  notifBadgeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    position: "relative",
  },
  badgeCount: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "8px",
    padding: "1px 5px",
    fontWeight: "900",
    borderRadius: "2px",
  },
  slidingPanel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "360px",
    height: "100vh",
    backgroundColor: "#fff",
    zIndex: 2000,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    borderLeft: "4px solid #020617",
  },
  panelHeader: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
  },
  panelList: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  panelFooter: {
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  notifCard: {
    padding: "15px",
    border: "1px solid #e2e8f0",
    transition: "0.2s",
  },
  notifType: {
    fontSize: "9px",
    fontWeight: "900",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  notifContent: { fontSize: "11px", color: "#334155", lineHeight: "1.5" },
  notifTime: { fontSize: "9px", color: "#94a3b8", marginTop: "8px" },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(2, 6, 23, 0.4)",
    zIndex: 1999,
  },
  archiveBtn: {
    padding: "15px",
    backgroundColor: "#020617",
    color: "#fff",
    border: "none",
    fontSize: "10px",
    fontWeight: "900",
    cursor: "pointer",
    width: "100%",
  },
  clearBtn: {
    padding: "15px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    fontSize: "10px",
    fontWeight: "900",
    cursor: "pointer",
    width: "100%",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  emptyNotif: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
  },
};

export default DashboardLayout;
