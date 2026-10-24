import { useState } from "react";
import { extendRequest, fulfillRequest, cancelRequest } from "../../api/requests";
import { ClockIcon, ShareIcon } from "../icons";
import "./TicketCard.css";

function TicketCard({ request, account, onChanged }) {
  const [busy, setBusy] = useState(""); // which action is running, or ""
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const unknownGroup = request.bloodGroup === "UNKNOWN";
  const title = unknownGroup ? "Blood needed" : `${request.bloodGroup} blood needed`;

  const message =
    `URGENT: ${unknownGroup ? "Blood" : request.bloodGroup + " blood"} needed at ` +
    `${request.location}. Please contact ${account.name}: +91 ${account.phone}. (Shared via LifeDrop)`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  // One helper for all three actions: show busy, call the server, refresh
  async function run(kind, action, successNote = "") {
    setBusy(kind);
    setError("");
    setNote("");
    try {
      await action(request.id);
      setNote(successNote);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <article className="ticket">
      <div className="ticket__status">
        <span className="ticket__dot" />
        Request is live
      </div>

      <h2 className="ticket__title">{title}</h2>
      <p className="ticket__where">{request.location}</p>
      <p className="ticket__hint">Donor replies will show here.</p>

      {confirming ? (
        <div className="ticket__confirm">
          <p className="ticket__ask">Close this request?</p>
          <div className="ticket__actions">
            <button
              type="button"
              className="tbtn tbtn--fill"
              disabled={Boolean(busy)}
              onClick={() => run("fulfill", fulfillRequest)}
            >
              {busy === "fulfill" ? "Closing…" : "Blood arranged"}
            </button>
            <button
              type="button"
              className="tbtn"
              disabled={Boolean(busy)}
              onClick={() => run("cancel", cancelRequest)}
            >
              {busy === "cancel" ? "Closing…" : "Cancel request"}
            </button>
          </div>
          <button type="button" className="link-btn" onClick={() => setConfirming(false)}>
            Keep it open
          </button>
        </div>
      ) : (
        <div className="ticket__actions">
          <button
            type="button"
            className="tbtn"
            disabled={Boolean(busy)}
            onClick={() => run("extend", extendRequest, "Extended by 48 hours.")}
          >
            <ClockIcon />
            {busy === "extend" ? "Extending…" : "Extend"}
          </button>
          <button
            type="button"
            className="tbtn tbtn--fill"
            disabled={Boolean(busy)}
            onClick={() => setConfirming(true)}
          >
            Fulfilled
          </button>
        </div>
      )}

      {error && <p className="ticket__error" role="alert">{error}</p>}
      {note && !error && <p className="ticket__note" role="status">{note}</p>}

      <a className="ticket__share" href={shareUrl} target="_blank" rel="noopener noreferrer">
        <ShareIcon />
        Share on WhatsApp
      </a>
    </article>
  );
}

export default TicketCard;