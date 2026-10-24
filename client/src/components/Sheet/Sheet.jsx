import { useEffect } from "react";
import "./Sheet.css";

// A panel that slides up from the bottom. Used for the profile and updates.
function Sheet({ open, onClose, title, children }) {
  // Close with the Escape key (helps keyboard users)
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet">
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grab" />
        {children}
      </div>
    </div>
  );
}

export default Sheet;