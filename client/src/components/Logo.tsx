import { Plane } from "lucide-react";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <span className="logo">
      <span className="logo-badge">
        <Plane size={16} strokeWidth={2.4} style={{ transform: "rotate(45deg)" }} />
      </span>
      {withWordmark && <span className="logo-word">Waypoint</span>}
    </span>
  );
}
