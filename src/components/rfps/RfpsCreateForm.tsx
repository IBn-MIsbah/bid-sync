/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  createRfpsInputSchema,
  type CreateRfpsInput,
} from "../../schemas/rfps.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRfps } from "../../services/api/rfp-api";

const RfpPriority = ["NORMAL", "URGENT"] as const;
// const RfpStatus = ["OPEN", "CLOSED", "AWARDED", "CANCELLED"] as const;

const RfpsCreateForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Ref to the file input so we can clear it manually on reset
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRfpsInput>({
    resolver: zodResolver(createRfpsInputSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: 0,
      status: "OPEN",
      priority: "NORMAL",
    },
  });

  const onSubmit = async (data: CreateRfpsInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // 1. Prepare Multipart Form Data
      const formData = new FormData();
      console.log(data);

      // 2. Map all JSON fields to the FormData object
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // If it's a Date (like deadline), format it to ISO string for the backend
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // 3. Attach the file using the key 'rfp_doc' (Matches Backend upload.single("rfp_doc"))
      if (selectedFile) {
        formData.append("rfp_doc", selectedFile);
      }

      // 4. API Call
      await createRfps(formData);

      // 5. Success UI Handling
      setSubmitSuccess(true);
      reset(); // Resets text fields
      setSelectedFile(null); // Resets local state
      if (fileInputRef.current) fileInputRef.current.value = ""; // Resets DOM input

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create RFP";
      setSubmitError(message);
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          marginBottom: "24px",
          color: "#1a202c",
          borderBottom: "2px solid #edf2f7",
          paddingBottom: "10px",
        }}
      >
        Post New Request for Proposal (RFP)
      </h2>

      {submitSuccess && (
        <div
          style={{
            backgroundColor: "#c6f6d5",
            color: "#22543d",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #9ae6b4",
          }}
        >
          ✅ RFP created successfully and is now live!
        </div>
      )}

      {submitError && (
        <div
          style={{
            backgroundColor: "#fed7d7",
            color: "#822727",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #feb2b2",
          }}
        >
          ❌ Error: {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#4a5568",
            }}
          >
            Title *
          </label>
          <input
            type="text"
            {...register("title")}
            placeholder="e.g. Annual Office Stationery Supply"
            style={{
              width: "100%",
              padding: "10px",
              border: `1px solid ${errors.title ? "#e53e3e" : "#cbd5e0"}`,
              borderRadius: "5px",
              outline: "none",
            }}
          />
          {errors.title && (
            <p style={{ color: "#e53e3e", fontSize: "13px", marginTop: "4px" }}>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#4a5568",
            }}
          >
            Detailed Description
          </label>
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Outline your requirements here..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #cbd5e0",
              borderRadius: "5px",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Category */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#4a5568",
              }}
            >
              Category *
            </label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. IT Services"
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${errors.category ? "#e53e3e" : "#cbd5e0"}`,
                borderRadius: "5px",
              }}
            />
          </div>

          {/* Budget */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#4a5568",
              }}
            >
              Budget (Estimated)
            </label>
            <input
              type="number"
              {...register("budget", { valueAsNumber: true })}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #cbd5e0",
                borderRadius: "5px",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Deadline */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#4a5568",
              }}
            >
              Submission Deadline *
            </label>
            <input
              type="datetime-local"
              {...register("deadline")}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${errors.deadline ? "#e53e3e" : "#cbd5e0"}`,
                borderRadius: "5px",
              }}
            />
            {errors.deadline && (
              <p
                style={{ color: "#e53e3e", fontSize: "13px", marginTop: "4px" }}
              >
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#4a5568",
              }}
            >
              Priority Level
            </label>
            <select
              {...register("priority")}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #cbd5e0",
                borderRadius: "5px",
                backgroundColor: "#fff",
              }}
            >
              {RfpPriority.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- File Upload Section --- */}
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "2px dashed #cbd5e0",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: "#f7fafc",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "600",
              color: "#2d3748",
            }}
          >
            Upload Tender Documents (PDF/Images)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
            }}
            style={{ fontSize: "14px", color: "#4a5568" }}
          />
          {selectedFile && (
            <p
              style={{
                marginTop: "10px",
                color: "#3182ce",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              📎 Selected: {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: isSubmitting ? "#a0aec0" : "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "18px",
            fontWeight: "700",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isSubmitting ? "Processing Upload..." : "Publish RFP Now"}
        </button>
      </form>
    </div>
  );
};

export default RfpsCreateForm;
