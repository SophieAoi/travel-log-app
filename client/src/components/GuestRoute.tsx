import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Inverse of ProtectedRoute: keeps logged-in users off /login and /signup.
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, checkingSession } = useAuth();

  if (checkingSession) return null;

  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}
