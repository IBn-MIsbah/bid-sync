/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "@/schemas/auth-schema";
import React from "react";

interface BusinessInfoProps {
  user: User;
}

export const BusinessInfo: React.FC<BusinessInfoProps> = ({ user }) => {
  const isSupplier = user.role === "SUPPLIER";
  const isBuyer = user.role === "BUYER";

  return (
    <section style={styles.card}>
      <h3 style={styles.sectionTitle}>BUSINESS_CORE_SPECIFICATIONS</h3>
      <div style={styles.infoList}>
        <InfoItem label="Email" value={user.email} />
        {isBuyer && (
          <>
            <InfoItem label="Entity" value={user.buyer?.companyName} />
            <InfoItem label="Dept" value={user.buyer?.department} />
            <InfoItem label="Address" value={user.buyer?.address} />
          </>
        )}
        {isSupplier && (
          <>
            <InfoItem label="TIN_ID" value={user.supplier?.taxId} />
            <InfoItem
              label="Reg_No"
              value={user.supplier?.registrationNumber}
            />
            <div style={styles.bioBox}>
              <strong>STRATEGY_BIO:</strong>
              <p>{user.supplier?.bio || "NO_BIO_PROVIDED"}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div style={styles.infoRow}>
    <span style={styles.label}>{label}:</span>
    <span style={styles.value}>{value || "NULL"}</span>
  </div>
);

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "#fff",
    padding: "24px",
    border: "2px solid #0F172A",
    boxShadow: "6px 6px 0px #0F172A",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "11px",
    fontWeight: "900",
    color: "#3182ce",
    letterSpacing: "1.5px",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "8px",
    textTransform: "uppercase",
  },
  infoList: { display: "flex", flexDirection: "column", gap: "12px" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
  },
  label: {
    color: "#718096",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: "10px",
  },
  value: { color: "#0F172A", fontWeight: "800" },
  bioBox: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#F8FAFC",
    border: "1px dashed #CBD5E0",
    fontSize: "11px",
  },
};
