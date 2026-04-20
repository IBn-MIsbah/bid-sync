/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetails, verifySupplier } from "../services/api/admin-api";

export const UserDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const fetchData = () => {
    if (id) {
      getUserDetails(id)
        .then((res) => setData(res.user))
        .catch(() => alert("Error loading details"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (status: "VERIFIED" | "REJECTED") => {
    if (status === "VERIFIED" && !window.confirm("Approve this supplier?"))
      return;

    try {
      await verifySupplier(
        id!,
        status,
        status === "REJECTED" ? reason : undefined,
      );
      setShowModal(false);
      setReason("");
      alert(`Supplier ${status}`);
      fetchData(); // Refresh page data
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  if (loading) return <div style={styles.loader}>Loading...</div>;
  if (!data) return <div>User not found</div>;

  const isSupplier = data.role === "SUPPLIER";

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Back
      </button>

      {/* ACTION BAR: Visible only for Pending Suppliers */}
      {isSupplier && data.supplier?.status === "PENDING" && (
        <div style={styles.actionHeader}>
          <p style={{ margin: 0 }}>
            <strong>Review Mode:</strong> Verify documents before approval.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleStatusUpdate("VERIFIED")}
              style={styles.approveBtn}
            >
              Approve
            </button>
            <button onClick={() => setShowModal(true)} style={styles.rejectBtn}>
              Reject
            </button>
          </div>
        </div>
      )}

      <div style={styles.mainGrid}>
        <div style={styles.column}>
          <section style={styles.card}>
            <h3>Account & {isSupplier ? "Business" : "Company"}</h3>
            <InfoRow
              label="Name"
              value={`${data.firstName} ${data.lastName}`}
            />
            <InfoRow label="Email" value={data.email} />
            <InfoRow
              label="Phone"
              value={isSupplier ? data.supplier?.phone : data.buyer?.phone}
            />
            {isSupplier && (
              <InfoRow label="Tax ID" value={data.supplier?.taxId} />
            )}
          </section>

          <section style={styles.card}>
            <h3>Verification Documents</h3>
            {data.supplier?.documents?.map((doc: any) => (
              <a
                key={doc.id}
                href={`http://localhost:5000/${doc.filePath}`}
                target="_blank"
                rel="noreferrer"
                style={styles.docLink}
              >
                📄 {doc.fileName} (View)
              </a>
            )) || "No documents uploaded."}
          </section>
        </div>

        <div style={styles.column}>
          <section style={styles.card}>
            <h3>Activity Logs</h3>
            {data.activityLogs?.map((log: any) => (
              <div key={log.id} style={styles.logItem}>
                <small>{new Date(log.createdAt).toLocaleDateString()}</small>
                <p style={{ margin: 0 }}>{log.action}</p>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* REJECTION MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Reject Supplier</h3>
            <p>Provide a reason so the user can correct their profile.</p>
            <textarea
              style={styles.textarea}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Tax ID document is expired..."
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate("REJECTED")}
                style={styles.submitRejectBtn}
                disabled={!reason.trim()}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid #f7fafc",
    }}
  >
    <span style={{ color: "#718096" }}>{label}:</span>
    <strong>{value || "N/A"}</strong>
  </div>
);

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px" },
  backBtn: {
    background: "none",
    border: "none",
    color: "#3182ce",
    cursor: "pointer",
    marginBottom: "20px",
  },
  actionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffaf0",
    border: "1px solid #feebc8",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  approveBtn: {
    backgroundColor: "#38a169",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  rejectBtn: {
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  docLink: {
    display: "block",
    color: "#3182ce",
    textDecoration: "none",
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginTop: "10px",
  },
  logItem: {
    fontSize: "13px",
    padding: "8px 0",
    borderBottom: "1px solid #f7fafc",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginTop: "10px",
    fontFamily: "inherit",
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "#718096",
    cursor: "pointer",
  },
  submitRejectBtn: {
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loader: { textAlign: "center", padding: "100px" },
};
