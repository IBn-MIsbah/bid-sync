import { SupplierOnboarding } from "../components/supplier/SupplierOnboarding";

const SupplierOnboardingPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7fafc",
        padding: "40px 0",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2d3748" }}>
        Supplier Onboarding
      </h1>
      <SupplierOnboarding />
    </div>
  );
};

export default SupplierOnboardingPage;
