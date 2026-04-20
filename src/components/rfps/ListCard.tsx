import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RFPS } from "../../schemas/rfps.schema";
import { getRfps } from "../../services/api/rfp-api";
import { getOrCreateConversation } from "../../services/api/chat-api";
import { useAuth } from "@/contexts/AuthContext";

const ListCard: React.FC = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState<RFPS[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isBuyer = user?.role === "BUYER";

  useEffect(() => {
    const fetchRfps = async () => {
      try {
        setLoading(true);
        const response = await getRfps();
        setRfps(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load RFPs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRfps();
  }, []);

  // --- NEW: CHAT INITIALIZATION LOGIC ---
  const handleContactBuyer = async (e: React.MouseEvent, rfp: RFPS) => {
    e.stopPropagation(); // Prevent card click navigation
    try {
      const chat = await getOrCreateConversation({
        rfpId: rfp.id,
      });
      navigate(`/dashboard/chat?id=${chat.id}`);
    } catch (err) {
      console.error("COMM_INIT_FAILURE", err);
    }
  };

  const handleCardClick = (rfpId: string) => {
    navigate(`/dashboard/rfps/${rfpId}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingState}>
        <div style={styles.spinner} />
        <p>RETRIVING_DATA...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {rfps.length === 0 && isBuyer ? (
        <div style={styles.emptyState}>
          <p>NO_DATA_FOUND</p>
          {error && <span>{error}</span>}
          <button
            onClick={() => navigate("/rfps/create")}
            style={styles.brutalistBtn}
          >
            POST_FIRST_RFP
          </button>
        </div>
      ) : (
        <>
          <div style={styles.headerRow}>
            <h2 style={styles.title}>AVAILABLE_OPPORTUNITIES</h2>
            <span style={styles.countBadge}>
              {rfps.length} {rfps.length === 1 ? "UNIT" : "UNITS"}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {rfps.map((rfp) => (
              <div
                key={rfp.id}
                onClick={() => handleCardClick(rfp.id)}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-4px, -4px)";
                  e.currentTarget.style.boxShadow = "8px 8px 0px #0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translate(0, 0)";
                  e.currentTarget.style.boxShadow = "4px 4px 0px #0F172A";
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.rfpTitle}>{rfp.title}</h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        ...styles.tag,
                        backgroundColor:
                          rfp.priority === "URGENT" ? "#ff4757" : "#ffa502",
                      }}
                    >
                      {rfp.priority}
                    </span>
                    <span style={{ ...styles.tag, backgroundColor: "#2ed573" }}>
                      {rfp.status}
                    </span>
                  </div>
                </div>

                <div style={styles.gridInfo}>
                  <p>
                    <strong>BUDGET:</strong>{" "}
                    <span style={{ color: "#2ed573" }}>
                      ${rfp.budget.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <strong>DEADLINE:</strong>{" "}
                    {new Date(rfp.deadline).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>BIDS:</strong> {rfp._count.bids}
                  </p>
                  <p>
                    <strong>ENTITY:</strong> {rfp.buyer.companyName}
                  </p>
                </div>

                {/* --- ACTION FOOTER --- */}
                <div style={styles.cardFooter}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(rfp.id);
                    }}
                    style={styles.actionBtnSecondary}
                  >
                    VIEW_DETAILS
                  </button>
                  <button
                    onClick={(e) => handleContactBuyer(e, rfp)}
                    style={styles.actionBtnPrimary}
                  >
                    CONTACT_BUYER
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loadingState: { textAlign: "center", padding: "3rem", fontWeight: "900" },
  spinner: {
    display: "inline-block",
    width: "40px",
    height: "40px",
    border: "4px solid #0F172A",
    borderTop: "4px solid #3182ce",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "900",
    letterSpacing: "1px",
  },
  countBadge: {
    backgroundColor: "#0F172A",
    color: "#fff",
    padding: "4px 12px",
    fontSize: "10px",
    fontWeight: "900",
  },
  card: {
    border: "2px solid #0F172A",
    padding: "1.5rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxShadow: "4px 4px 0px #0F172A",
    transition: "0.15s all",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  rfpTitle: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "900",
    textTransform: "uppercase",
  },
  tag: {
    color: "white",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "900",
  },
  gridInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    fontSize: "12px",
    marginBottom: "1rem",
  },
  cardFooter: {
    display: "flex",
    gap: "10px",
    borderTop: "2px solid #F1F5F9",
    paddingTop: "1rem",
  },
  actionBtnPrimary: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#0F172A",
    color: "#fff",
    border: "none",
    fontWeight: "900",
    fontSize: "11px",
    cursor: "pointer",
  },
  actionBtnSecondary: {
    flex: 1,
    padding: "10px",
    backgroundColor: "transparent",
    border: "2px solid #0F172A",
    fontWeight: "900",
    fontSize: "11px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    border: "2px dashed #CBD5E0",
  },
  brutalistBtn: {
    marginTop: "1rem",
    padding: "10px 20px",
    backgroundColor: "#3182ce",
    color: "#fff",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default ListCard;
