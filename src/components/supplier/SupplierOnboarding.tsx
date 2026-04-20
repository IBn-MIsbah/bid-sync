/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  updateSupplierProfile,
  uploadSupplierDocument,
} from "../../services/api/supplier-api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type ProfileStep = {
  phone: string;
  address: string;
  taxId: string;
  registrationNumber: string;
  yearsInBusiness: number;
  bio: string;
};

export const SupplierOnboarding = () => {
  const { user } = useAuth(); // Data from your JSON structure
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset, // Used to populate the form
  } = useForm<ProfileStep>();

  // POPULATE FORM: When user data is available, fill the inputs
  useEffect(() => {
    if (user?.supplier) {
      reset({
        phone: user.supplier.phone || "",
        address: user.supplier.address || "",
        taxId: user.supplier.taxId || "",
        registrationNumber: user.supplier.registrationNumber || "",
        yearsInBusiness: user.supplier.yearsInBusiness || 0,
        bio: user.supplier.bio || "",
      });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data: ProfileStep) => {
    setLoading(true);
    try {
      await updateSupplierProfile({
        ...data,
        categories: user?.supplier?.categories || ["General"],
      });
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const onDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("business_doc", file);
    formData.append("documentType", "BUSINESS_LICENSE");

    try {
      await uploadSupplierDocument(formData);
      alert("Verification document uploaded successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Document upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.stepIndicator}>
        <div
          onClick={() => setStep(1)}
          style={{
            ...styles.step,
            backgroundColor: step === 1 ? "#3182ce" : "#edf2f7",
            color: step === 1 ? "#fff" : "#4a5568",
            cursor: "pointer",
          }}
        >
          1. Business Details
        </div>
        <div
          onClick={() => setStep(2)}
          style={{
            ...styles.step,
            backgroundColor: step === 2 ? "#3182ce" : "#edf2f7",
            color: step === 2 ? "#fff" : "#4a5568",
            cursor: "pointer",
          }}
        >
          2. Verification Docs
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmit(onProfileSubmit)} style={styles.form}>
          <div style={styles.formHeader}>
            <h2>Business Profile</h2>
            <p style={styles.infoText}>
              Hello, {user?.firstName}. Complete your business identity below.
            </p>
          </div>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                {...register("phone", { required: "Phone is required" })}
                placeholder="+251..."
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tax ID (TIN)</label>
              <input
                {...register("taxId", { required: "TIN is required" })}
                placeholder="10-digit TIN"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Registration Number</label>
              <input {...register("registrationNumber")} style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Years in Business</label>
              <input
                type="number"
                {...register("yearsInBusiness")}
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Business Address</label>
            <textarea {...register("address")} style={styles.textarea} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Business Bio</label>
            <textarea
              {...register("bio")}
              style={styles.textarea}
              placeholder="Tell us about your services..."
            />
          </div>
          <div style={styles.btnGroup}>
            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? "Saving..." : "Save & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={styles.secondaryBtn}
            >
              Skip to Upload
            </button>
          </div>
        </form>
      ) : (
        <div style={styles.form}>
          <div style={styles.formHeader}>
            <h2>Verify Your Business</h2>
            <p style={styles.infoText}>
              Current Status:{" "}
              <strong>{user?.supplier?.status || "NOT_STARTED"}</strong>
            </p>
          </div>

          <div style={styles.uploadArea}>
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={styles.fileInput}
            />
            {file && <p style={styles.fileSelected}>Selected: {file.name}</p>}
          </div>

          <div style={styles.btnGroup}>
            <button onClick={() => setStep(1)} style={styles.secondaryBtn}>
              Back
            </button>
            <button
              onClick={onDocumentSubmit}
              disabled={loading || !file}
              style={styles.primaryBtn}
            >
              {loading ? "Uploading..." : "Complete Submission"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ... Styles remain the same as previous response ...
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "700px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "#fff",
    border: "2px solid #0F172A",
    boxShadow: "8px 8px 0px #0F172A",
  },
  stepIndicator: { display: "flex", gap: "1rem", marginBottom: "2rem" },
  step: {
    flex: 1,
    padding: "12px",
    textAlign: "center",
    borderRadius: "4px",
    fontWeight: "900",
    fontSize: "11px",
    textTransform: "uppercase",
    border: "1px solid #0F172A",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  formHeader: { borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" },
  infoText: { fontSize: "13px", color: "#718096", margin: "5px 0 0 0" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#4A5568",
    textTransform: "uppercase",
  },
  input: { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "4px" },
  textarea: {
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    minHeight: "80px",
  },
  uploadArea: {
    padding: "3rem 1rem",
    border: "2px dashed #cbd5e0",
    borderRadius: "8px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
  },
  fileInput: { fontSize: "13px" },
  fileSelected: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#3182ce",
    fontWeight: "bold",
  },
  primaryBtn: {
    padding: "12px 24px",
    backgroundColor: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: "12px",
  },
  secondaryBtn: {
    padding: "12px 24px",
    backgroundColor: "#fff",
    color: "#4a5568",
    border: "1px solid #cbd5e0",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: "12px",
  },
  btnGroup: { display: "flex", gap: "1rem", marginTop: "1rem" },
};
