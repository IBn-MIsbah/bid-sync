import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RfpDetail } from "../components/rfps/RfpDetail";

const RfpDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Invalid RFP ID</p>
        <button onClick={() => navigate("/rfps")}>Back to RFPs</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        <button
          onClick={() => navigate("/rfps")}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#5a6268")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#6c757d")
          }
        >
          ← Back to RFPs
        </button>
        <RfpDetail rfpId={id} />
      </div>
    </div>
  );
};

export default RfpDetailPage;
