import React from "react";
import { useNavigate } from "react-router-dom";
import RfpsCreateForm from "../components/rfps/RfpsCreateForm";

const CreateRfpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header with navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <div>
            <h1 style={{ margin: 0, color: "#333" }}>Create New RFP</h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
              Fill out the form below to create a new Request for Proposal
            </p>
          </div>
          <button
            onClick={() => navigate("/rfps")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#5a6268")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#6c757d")
            }
          >
            Back to RFPs
          </button>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            padding: "2rem",
          }}
        >
          <RfpsCreateForm />
        </div>

        {/* Info Note */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
            borderLeft: "4px solid #007bff",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#004085" }}>
            <strong>Note:</strong> All fields marked with * are required. The
            buyer ID will be automatically assigned from your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRfpPage;
