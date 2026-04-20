import React, { useEffect, useState } from "react";
import { getMyBids } from "../../services/api/supplier-api";

interface Bid {
  id: string;
  rfpId: string;
  supplierId: string;
  amount: number | null;
  proposal: string;
  proposalPath: string | null;
  status: string;
  rejectionReason: string;
  createdAt: string;
  rfp: {
    id: string;
    title: string;
    category: string;
    budget: string;
    currency: string;
    deadline: string;
    status: string;
    buyer: {
      companyName: string;
    };
  };
}

const BidHistory: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await getMyBids();
        // Handle different response structures
        const bidData = response.data?.data || response.data || [];
        setBids(Array.isArray(bidData) ? bidData : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch bids:", err);
        setError("Failed to load bid history");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading your bids...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p>You haven't placed any bids yet.</p>
        <p>Browse RFPs to start bidding!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Bid History</h2>
      <div style={styles.bidsList}>
        {bids.map((bid) => (
          <div key={bid.id} style={styles.bidCard}>
            <div style={styles.bidHeader}>
              <h3 style={styles.rfpTitle}>{bid.rfp.title}</h3>
              <span
                style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(bid.status),
                }}
              >
                {bid.status}
              </span>
            </div>

            <div style={styles.bidInfo}>
              <div style={styles.infoRow}>
                <strong>Buyer:</strong> {bid.rfp.buyer.companyName}
              </div>
              <div style={styles.infoRow}>
                <strong>Category:</strong> {bid.rfp.category}
              </div>
              <div style={styles.infoRow}>
                <strong>Budget Range:</strong> {bid.rfp.currency}{" "}
                {Number(bid.rfp.budget).toLocaleString()}
              </div>
              <div style={styles.infoRow}>
                <strong>Your Bid Amount:</strong>{" "}
                {bid.amount ? (
                  <span style={styles.bidAmount}>
                    {bid.rfp.currency} {bid.amount.toLocaleString()}
                  </span>
                ) : (
                  <span style={styles.pendingAmount}>Pending approval</span>
                )}
              </div>
              <div style={styles.infoRow}>
                <strong>Proposal:</strong> {bid.proposal}
              </div>
              <div style={styles.infoRow}>
                <strong>Submitted:</strong>{" "}
                {new Date(bid.createdAt).toLocaleString()}
              </div>
              <div style={styles.infoRow}>
                <strong>Deadline:</strong>{" "}
                {new Date(bid.rfp.deadline).toLocaleDateString()}
              </div>
              {bid.rejectionReason && (
                <div style={styles.rejectionReason}>
                  <strong>Rejection Reason:</strong> {bid.rejectionReason}
                </div>
              )}
            </div>

            <div style={styles.bidActions}>
              {bid.status === "PENDING_APPROVAL" && (
                <button style={styles.pendingButton} disabled>
                  Waiting for Approval
                </button>
              )}
              {bid.status === "ACTIVE" && !bid.amount && (
                <button
                  onClick={() => {
                    /* Navigate to financial bid submission */
                  }}
                  style={styles.submitButton}
                >
                  Submit Financial Bid
                </button>
              )}
              {(bid.status === "PENDING_APPROVAL" ||
                bid.status === "ACTIVE") && (
                <button
                  onClick={() => {
                    /* Handle withdraw */
                  }}
                  style={styles.withdrawButton}
                >
                  Withdraw Bid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "PENDING_APPROVAL":
      return styles.statusPending;
    case "ACTIVE":
      return styles.statusActive;
    case "AWARDED":
      return styles.statusAwarded;
    case "WITHDRAWN":
      return styles.statusWithdrawn;
    case "CLOSED":
      return styles.statusClosed;
    default:
      return styles.statusDefault;
  }
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    color: "#1a202c",
  },
  bidsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  bidCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  bidHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #e2e8f0",
  },
  rfpTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#2d3748",
    margin: 0,
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  statusPending: {
    backgroundColor: "#fef5e7",
    color: "#f39c12",
  },
  statusActive: {
    backgroundColor: "#e3f7fc",
    color: "#00a3c4",
  },
  statusAwarded: {
    backgroundColor: "#e8f5e9",
    color: "#4caf50",
  },
  statusWithdrawn: {
    backgroundColor: "#fbe9e7",
    color: "#f44336",
  },
  statusClosed: {
    backgroundColor: "#f5f5f5",
    color: "#9e9e9e",
  },
  statusDefault: {
    backgroundColor: "#e8eaf6",
    color: "#3f51b5",
  },
  bidInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  infoRow: {
    fontSize: "0.875rem",
    color: "#4a5568",
  },
  bidAmount: {
    color: "#2f855a",
    fontWeight: "bold",
  },
  pendingAmount: {
    color: "#f39c12",
    fontStyle: "italic",
  },
  rejectionReason: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "#fff5f5",
    borderRadius: "4px",
    color: "#c53030",
    fontSize: "0.875rem",
  },
  bidActions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #e2e8f0",
  },
  pendingButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#cbd5e0",
    color: "#4a5568",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    cursor: "not-allowed",
  },
  submitButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  withdrawButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#fff",
    color: "#e53e3e",
    border: "1px solid #e53e3e",
    borderRadius: "4px",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3182ce",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#fff5f5",
    borderRadius: "8px",
    color: "#c53030",
  },
  retryButton: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "3rem",
    color: "#718096",
  },
};

// Add spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default BidHistory;
