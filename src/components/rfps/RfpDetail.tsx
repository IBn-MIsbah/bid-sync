/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { getRfpsById } from "../../services/api/rfp-api";
import {
  applyToBid,
  submitFinancialBid,
  updateApplicationStatus,
  awardBid,
} from "../../services/api/bid-api";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "http://localhost:5000";

export const RfpDetail = ({ rfpId }: { rfpId: string }) => {
  const { user } = useAuth();
  const socket = useSocket();

  const [rfp, setRfp] = useState<any>(null);
  const [userBid, setUserBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [proposalText, setProposalText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [financialAmount, setFinancialAmount] = useState<number>(0);

  // 1. Initial Data Fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getRfpsById(rfpId);
      const rfpData = response.data;
      setRfp(rfpData);

      const existingBid = rfpData.bids?.find(
        (b: any) => b.supplierId === user?.id,
      );
      setUserBid(existingBid);
    } catch (err) {
      console.error("Error fetching RFP:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rfpId]);

  // 2. Socket Lifecycle
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_rfp", rfpId);

    socket.on("new_bid_received", () => fetchData()); // Refresh data on new events
    socket.on("rfp_awarded", () => fetchData());

    return () => {
      socket.off("new_bid_received");
      socket.off("rfp_awarded");
      socket.emit("leave_rfp", rfpId);
    };
  }, [socket, rfpId]);

  // --- ACTIONS ---

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload a proposal PDF");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("proposal", proposalText);
      formData.append("proposalFile", selectedFile);
      await applyToBid(rfpId, formData);
      alert("Application submitted successfully!");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinancialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFinancialBid(userBid.id, financialAmount);
      alert("Financial bid submitted!");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (
    bidId: string,
    newStatus: "ACTIVE" | "REJECTED",
  ) => {
    let reason = "";
    if (newStatus === "REJECTED") {
      reason = prompt("Reason for rejection:") || "Does not meet requirements";
    }
    try {
      setSubmitting(true);
      await updateApplicationStatus(bidId, {
        status: newStatus,
        rejectionReason: reason,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAwardContract = async (bidId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to award this contract? This will close the RFP.",
      )
    )
      return;
    try {
      setSubmitting(true);
      await awardBid(bidId);
      alert("Contract Awarded Successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Awarding failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading RFP Details...</div>;
  if (!rfp) return <div>RFP not found.</div>;

  const isBuyer = user?.role === "BUYER" && rfp.buyerId === user?.id;
  const isSupplier = user?.role === "SUPPLIER";
  const canApply = isSupplier && !userBid && rfp.status === "OPEN";
  const isPending = userBid?.status === "PENDING_APPROVAL";
  const isApproved = userBid?.status === "ACTIVE";

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <header style={styles.header}>
          <h1>{rfp.title}</h1>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, ...statusColors[rfp.status] }}>
              {rfp.status}
            </span>
            {rfp.priority === "URGENT" && (
              <span style={styles.urgentBadge}>URGENT</span>
            )}
          </div>
        </header>

        <div style={styles.detailsGrid}>
          <p>
            <strong>Category:</strong> {rfp.category}
          </p>
          <p>
            <strong>Budget:</strong>{" "}
            <span style={styles.price}>
              {rfp.currency || "ETB"} {Number(rfp.budget).toLocaleString()}
            </span>
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(rfp.deadline).toLocaleDateString()}
          </p>
        </div>

        <div style={styles.descriptionSection}>
          <h4>Description</h4>
          <p>{rfp.description}</p>
        </div>

        {/* --- SUPPLIER INTERFACE --- */}
        {isSupplier && rfp.status === "OPEN" && (
          <div style={styles.actionArea}>
            {canApply && (
              <form onSubmit={handleApply} style={styles.formBox}>
                <h3>Step 1: Request to Bid</h3>
                <textarea
                  placeholder="Technical proposal summary..."
                  style={styles.textarea}
                  onChange={(e) => setProposalText(e.target.value)}
                  required
                />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.primaryBtn}
                >
                  Submit Application
                </button>
              </form>
            )}

            {isPending && (
              <div style={styles.infoBox}>
                <p>
                  ⏳ <strong>Pending Review:</strong> Your technical proposal is
                  being reviewed by the buyer.
                </p>
              </div>
            )}

            {isApproved && (
              <form onSubmit={handleFinancialSubmit} style={styles.formBox}>
                <h3>Step 2: Submit Financial Bid</h3>
                <input
                  type="number"
                  placeholder="Enter Bid Amount"
                  style={styles.input}
                  onChange={(e) => setFinancialAmount(Number(e.target.value))}
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.successBtn}
                >
                  Submit Final Price
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* --- BUYER MANAGEMENT INTERFACE --- */}
      {isBuyer && (
        <div style={styles.bidsList}>
          <h2 style={{ marginTop: "2.5rem" }}>Supplier Applications</h2>
          {rfp.bids?.length === 0 ? (
            <p>No bids yet.</p>
          ) : (
            rfp.bids.map((bid: any) => (
              <div key={bid.id} style={styles.bidItem}>
                <div style={styles.bidItemHeader}>
                  <strong>{bid.supplier?.businessName}</strong>
                  <span
                    style={{
                      ...styles.smallBadge,
                      ...statusColors[bid.status],
                    }}
                  >
                    {bid.status}
                  </span>
                </div>
                <p style={styles.bidText}>{bid.proposal}</p>

                <div style={styles.bidFooter}>
                  <div style={styles.bidLinks}>
                    {bid.proposalPath && (
                      <a
                        href={`${API_BASE_URL}/${bid.proposalPath}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        📄 View Proposal
                      </a>
                    )}
                    {bid.amount && (
                      <span style={styles.amountLabel}>
                        Bid: {rfp.currency} {bid.amount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div style={styles.btnGroup}>
                    {bid.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(bid.id, "ACTIVE")}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#38A169",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(bid.id, "REJECTED")}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: "#E53E3E",
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {bid.status === "ACTIVE" && rfp.status === "OPEN" && (
                      <button
                        onClick={() => handleAwardContract(bid.id)}
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: "#6B46C1",
                        }}
                      >
                        Award Contract
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const statusColors: any = {
  OPEN: { backgroundColor: "#C6F6D5", color: "#22543D" },
  PENDING_APPROVAL: { backgroundColor: "#FEEBC8", color: "#744210" },
  ACTIVE: { backgroundColor: "#BEE3F8", color: "#2A4365" },
  AWARDED: { backgroundColor: "#E9D8FD", color: "#44337A" },
  REJECTED: { backgroundColor: "#FED7D7", color: "#822727" },
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: "900px", margin: "40px auto", padding: "0 20px" },
  mainCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  badges: { display: "flex", gap: "10px" },
  badge: {
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  urgentBadge: {
    backgroundColor: "#FFF5F5",
    color: "#C53030",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #edf2f7",
  },
  price: { color: "#2F855A", fontWeight: "bold" },
  descriptionSection: { margin: "25px 0" },
  actionArea: {
    backgroundColor: "#F7FAFC",
    padding: "20px",
    borderRadius: "8px",
  },
  formBox: { display: "flex", flexDirection: "column", gap: "12px" },
  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
    minHeight: "100px",
    fontFamily: "inherit",
  },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #E2E8F0" },
  primaryBtn: {
    backgroundColor: "#3182CE",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  successBtn: {
    backgroundColor: "#38A169",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  infoBox: {
    padding: "15px",
    backgroundColor: "#EBF8FF",
    borderRadius: "6px",
    borderLeft: "4px solid #3182CE",
  },
  bidsList: { marginTop: "20px" },
  bidItem: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    marginBottom: "15px",
  },
  bidItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  bidText: { color: "#4A5568", fontSize: "0.9rem" },
  bidFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
  },
  bidLinks: { display: "flex", gap: "15px", alignItems: "center" },
  link: {
    color: "#3182CE",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  amountLabel: { fontWeight: "bold", color: "#2F855A" },
  btnGroup: { display: "flex", gap: "8px" },
  actionBtn: {
    color: "white",
    border: "none",
    padding: "6px 14px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  smallBadge: {
    fontSize: "0.65rem",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    marginTop: "100px",
    fontSize: "1.1rem",
    color: "#718096",
  },
};
