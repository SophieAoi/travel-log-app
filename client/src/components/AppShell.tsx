import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Nav } from "./Nav";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="app-shell">
      <Nav />
      <main className="app-content">{children}</main>
    </div>
  );
}
