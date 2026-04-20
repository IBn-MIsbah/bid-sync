/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLogDashboard from "../components/admin/Logs";
import BidHistory from "../components/supplier/BidHistory";
import { ChatPage } from "../pages/ChatPage";
import AuditPage from "../components/admin/AuditPage";
import { LandingPage } from "../pages/LandingPage";

// 1. Lazy load ALL page components
const Login = lazy(() => import("../pages/LoginPage"));
const RegisterForm = lazy(() =>
  import("../pages/RegisterForm").then((m) => ({ default: m.RegisterForm })),
);
const DashboardLayout = lazy(() =>
  import("../layout/DashboardLayout").then((m) => ({
    default: m.DashboardLayout,
  })),
);
const DashboardHome = lazy(() =>
  import("../components/DashboardHome").then((m) => ({
    default: m.DashboardHome,
  })),
);
const RfpsPage = lazy(() => import("../pages/RfpsPage"));
const CreateRfpPage = lazy(() => import("../pages/CreateRfpPage"));
const RfpDetailPage = lazy(() => import("../pages/RfpDetailPage"));
const SupplierOnboardingPage = lazy(
  () => import("../pages/SupplierOnboardingPage"),
);
const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const UserManagement = lazy(() =>
  import("../pages/UserManagement").then((m) => ({
    default: m.UserManagement,
  })),
);
const UserDetailView = lazy(() =>
  import("../pages/UserDetailView").then((m) => ({
    default: m.UserDetailView,
  })),
);

// Helper for loading states
const PageLoader = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>Loading page...</div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterForm />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<PageLoader />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "onboarding",
        element: <SupplierOnboardingPage />,
      },
      {
        path: "rfps",
        element: <RfpsPage />,
      },
      {
        path: "rfps/create",
        element: <CreateRfpPage />,
      },
      {
        path: "rfps/:id",
        element: <RfpDetailPage />,
      },
      {
        path: "admin/users",
        element: <UserManagement />,
      },
      {
        path: "admin/users/:id",
        element: <UserDetailView />,
      },
      {
        path: "admin/logs",
        element: <AdminLogDashboard />,
      },
      {
        path: "admin/audit",
        element: <AuditPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "my-bids",
        element: <BidHistory />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/unauthorized",
    element: (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>403 - Unauthorized</h1>
      </div>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
