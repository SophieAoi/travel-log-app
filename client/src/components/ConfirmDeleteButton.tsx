import { useEffect, useRef, useState } from "react";
import { Trash2, Check } from "lucide-react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  confirmLabel?: string;
  className?: string;
  armedTimeoutMs?: number;
}

export function ConfirmDeleteButton({
  onConfirm,
  disabled,
  label = "Delete",
  confirmLabel = "Confirm delete?",
  className = "icon-only-button ghost danger",
  armedTimeoutMs = 4000,
}: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      setArmed(true);
      timeoutRef.current = setTimeout(() => setArmed(false), armedTimeoutMs);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setArmed(false);
    onConfirm();
  }

  return (
    <button
      className={`${className} ${armed ? "confirm-armed" : ""}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={armed ? confirmLabel : label}
      type="button"
    >
      {armed ? <Check size={14} /> : <Trash2 size={14} />}
    </button>
  );
}
