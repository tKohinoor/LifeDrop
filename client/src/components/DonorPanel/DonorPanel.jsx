import { useState, useEffect, useCallback } from "react";
import {
  getDonorRequests,
  updateDonor,
  respondToRequest,
  withdrawResponse,
} from "../../api/requests";
import { DropIcon, PhoneIcon } from "../icons";
import { timeAgo } from "../../utils/timeAgo";
import "./DonorPanel.css";

// The server compares dates in UTC, so we send today's UTC date
const todayUtc = () => new Date().toISOString().slice(0, 10);

function DonorPanel({ donor, onProfileChanged }) {
  const [list, setList] = useState(null); // null = not loaded yet
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmingDonation, setConfirmingDonation] = useState(false);

  const load = useCallback(async () => {
    try {
      setList(await getDonorRequests());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Load when the tab opens, and again when the person comes back to the app
  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  // One helper for every button: show busy, call the server, refresh both lists
  async function run(kind, action) {
    setBusy(kind);
    setError("");
    try {
      await action();
      await Promise.all([load(), onProfileChanged()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
      setConfirmingDonation(false);
    }
  }

  const anyBusy = Boolean(busy);

  return (
    <div className="dpanel">
      {/* Status card: available, paused or resting */}
      <section className="dstatus">
        {donor.eligible && (
          <>
            <span className="dstatus__pill dstatus__pill--on">Available</span>
            <p className="dstatus__text">Requests that match your blood group appear below.</p>

            {confirmingDonation ? (
              <div className="dstatus__confirm">
                <p>Record a donation today? You'll be hidden from requests for 90 days.</p>
                <div className="dstatus__actions">
                  <button
                    type="button"
                    className="tbtn tbtn--fill"
                    disabled={anyBusy}
                    onClick={() => run("donated", () => updateDonor({ lastDonatedOn: todayUtc() }))}
                  >
                    {busy === "donated" ? "Saving…" : "Yes, I donated"}
                  </button>
                  <button type="button" className="tbtn" onClick={() => setConfirmingDonation(false)}>
                    Not yet
                  </button>
                </div>
              </div>
            ) : (
              <div className="dstatus__actions">
                <button
                  type="button"
                  className="tbtn"
                  disabled={anyBusy}
                  onClick={() => run("pause", () => updateDonor({ available: false }))}
                >
                  {busy === "pause" ? "Pausing…" : "Pause"}
                </button>
                <button
                  type="button"
                  className="tbtn"
                  disabled={anyBusy}
                  onClick={() => setConfirmingDonation(true)}
                >
                  I just donated
                </button>
              </div>
            )}
          </>
        )}

        {!donor.eligible && donor.reason === "paused" && (
          <>
            <span className="dstatus__pill">Paused</span>
            <p className="dstatus__text">You won't see requests while you are paused.</p>
            <button
              type="button"
              className="tbtn tbtn--fill"
              disabled={anyBusy}
              onClick={() => run("resume", () => updateDonor({ available: true }))}
            >
              {busy === "resume" ? "Resuming…" : "Resume"}
            </button>
          </>
        )}

        {!donor.eligible && donor.reason === "resting" && (
          <>
            <span className="dstatus__pill">Resting</span>
            <p className="dstatus__text">
              Thank you for donating! You'll see requests again in {donor.daysLeft} days.
            </p>
            <button
              type="button"
              className="tbtn"
              disabled={anyBusy}
              onClick={() => run("undo", () => updateDonor({ lastDonatedOn: null }))}
            >
              {busy === "undo" ? "Saving…" : "Undo (tapped by mistake)"}
            </button>
          </>
        )}
      </section>

      {error && <p className="dpanel__error" role="alert">{error}</p>}

      {/* Matching requests (only for available donors) */}
      {list?.eligible && list.requests.length === 0 && (
        <p className="dpanel__empty">
          No matching requests right now. Check back soon. Alerts are coming later.
        </p>
      )}

      {list?.eligible &&
        list.requests.map((request) => (
          <article className="dreq" key={request.id}>
            <div className="dreq__top">
              <span className="dreq__group">
                {request.bloodGroup === "UNKNOWN" ? "Group not confirmed" : request.bloodGroup}
              </span>
              <span className="dreq__meta">
                {request.distanceKm !== null && `${request.distanceKm} km · `}
                {timeAgo(request.createdAt)}
              </span>
            </div>

            <p className="dreq__where">{request.location}</p>
            <p className="dreq__who">Asked by {request.requesterName}</p>

            {request.responded ? (
              <div className="dreq__contact">
                <p>Thank you! Please call {request.requesterName} now.</p>
                <a className="tbtn tbtn--fill" href={`tel:+91${request.requesterPhone}`}>
                  <PhoneIcon />
                  Call +91 {request.requesterPhone}
                </a>
                <button
                  type="button"
                  className="link-btn"
                  disabled={anyBusy}
                  onClick={() => run(`w-${request.id}`, () => withdrawResponse(request.id))}
                >
                  {busy === `w-${request.id}` ? "Withdrawing…" : "I can't make it any more"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="tbtn tbtn--fill dreq__help"
                disabled={anyBusy}
                onClick={() => run(`r-${request.id}`, () => respondToRequest(request.id))}
              >
                <DropIcon />
                {busy === `r-${request.id}` ? "Sending…" : "I can help"}
              </button>
            )}
          </article>
        ))}
    </div>
  );
}

export default DonorPanel;