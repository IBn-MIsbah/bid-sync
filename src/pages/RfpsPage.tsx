import ListCard from "../components/rfps/ListCard";

const RfpsPage = () => {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          marginBottom: "2rem",
          borderBottom: "2px solid #e0e0e0",
          paddingBottom: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            color: "#333",
            margin: 0,
          }}
        >
          Request for Proposals
        </h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Browse and respond to open opportunities
        </p>
      </header>

      <ListCard />
    </div>
  );
};

export default RfpsPage;
