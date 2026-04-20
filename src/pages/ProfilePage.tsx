import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { BusinessInfo } from "@/components/profile/BusinessInfo";
import { ResourceLedger } from "@/components/profile/ResourceLedger";
import { SecuritySettings } from "@/components/profile/SecuritySettings";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) return null;

  // const isSupplier = user.role === "SUPPLIER";
  const isBuyer = user.role === "BUYER";
  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";

  const tabs = [
    { id: "overview", label: "OVERVIEW", icon: "👤" },
    { id: "security", label: "SECURITY", icon: "🔒" },
    {
      id: "resources",
      label: isBuyer ? "RFPS" : "DOCUMENTS",
      icon: isBuyer ? "📋" : "📁",
    },
  ];

  // Remove tabs that shouldn't be shown for admins
  const visibleTabs = isAdmin ? tabs.filter((t) => t.id !== "resources") : tabs;

  return (
    <div style={styles.container}>
      <ProfileHeader user={user} />

      <ProfileTabs
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={styles.contentContainer}>
        {activeTab === "overview" && <BusinessInfo user={user} />}
        {activeTab === "security" && <SecuritySettings user={user} />}
        {activeTab === "resources" && !isAdmin && (
          <ResourceLedger user={user} />
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  contentContainer: {
    animation: "fadeIn 0.3s ease-in-out",
  },
};
