import { useState, useEffect, useCallback } from "react";
import DropLogo from "../../components/DropLogo/DropLogo";
import Button from "../../components/Button/Button";
import Sheet from "../../components/Sheet/Sheet";
import TicketCard from "../../components/TicketCard/TicketCard";
import DonorPanel from "../../components/DonorPanel/DonorPanel";
import ProfileSheet from "../../components/ProfileSheet/ProfileSheet";
import { FaceIcon, BellIcon, PlusIcon, ShieldIcon, PhoneIcon } from "../../components/icons";
import { getMe } from "../../api/requests";
import { clearSession } from "../../api/session";
import { timeAgo } from "../../utils/timeAgo";
import "./DashboardScreen.css";

function DashboardScreen({ onNewRequest, onBecomeDonor, onSignedOut, initialTab = "mine" }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [sheet, setSheet] = useState(null); // "profile" | "updates" | null
  const [tab, setTab] = useState(initialTab); // "mine" | "help"

  const load = useCallback(async () => {
    try {
      setData(await getMe());
      setLoadError("");
    } catch (error) {
      if (error.unauthorized) {
        onSignedOut();
        return;
      }
      setLoadError(error.message);
    }
  }, [onSignedOut]);

  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  function handleLogout() {
    clearSession();
    onSignedOut();
  }

  const tickets = data?.activeRequests ?? [];
  const isDonor = Boolean(data?.donor);
  const showHelp = isDonor && tab === "help";

  // Every donor reply across all tickets, newest first, for the bell
  const replies = tickets
    .flatMap((ticket) =>
      ticket.responses.map((reply) => ({ ...reply, requestGroup: ticket.bloodGroup }))
    )
    .sort((a, b) => new Date(b.respondedAt) - new Date(a.respondedAt));

  return (
    <div className="dash-page">
      <div className="dash">
        <header className="dash__bar">
          <button
            type="button"
            className="dash__icon dash__avatar"
            onClick={() => setSheet("profile")}
            aria-label="Open your profile"
          >
            <FaceIcon />
          </button>

          <div className="dash__brand">
            <DropLogo size="28px" />
            <span>
              Life<span>Drop</span>
            </span>
          </div>

          <button
            type="button"
            className="dash__icon"
            onClick={() => setSheet("updates")}
            aria-label="Updates"
          >
            <BellIcon />
          </button>
        </header>

        {/* The tabs only exist for people who are also donors */}
        {isDonor && (
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "mine"}
              className={`tabs__tab ${tab === "mine" ? "tabs__tab--on" : ""}`}
              onClick={() => setTab("mine")}
            >
              My requests
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "help"}
              className={`tabs__tab ${tab === "help" ? "tabs__tab--on" : ""}`}
              onClick={() => setTab("help")}
            >
              Help others
            </button>
          </div>
        )}

        <main className="dash__body">
          {!data && !loadError && <p className="dash__status">Loading…</p>}

          {!data && loadError && (
            <div className="dash__status">
              <p>{loadError}</p>
              <button type="button" className="link-btn" onClick={load}>
                Try again
              </button>
            </div>
          )}

          {data && showHelp && <DonorPanel donor={data.donor} onProfileChanged={load} />}

          {data && !showHelp && (
            <>
              {tickets.length === 0 && (
                <div className="dash__empty">
                  <h1>No active requests</h1>
                  <p>If someone needs blood, start a request. It takes about a minute.</p>
                </div>
              )}

              {tickets.map((request) => (
                <TicketCard
                  key={request.id}
                  request={request}
                  account={data.account}
                  onChanged={load}
                />
              ))}

              {tickets.length > 0 && !data.account.phoneVerified && (
                <button type="button" className="dash__nudge" onClick={() => setSheet("profile")}>
                  <ShieldIcon />
                  Verify your number so donors can trust your request
                </button>
              )}
            </>
          )}
        </main>

        <footer className="dash__footer">
          <Button
            variant={tickets.length > 0 || showHelp ? "secondary" : "primary"}
            icon={<PlusIcon />}
            onClick={onNewRequest}
          >
            New request
          </Button>
        </footer>
      </div>

      <ProfileSheet
        open={sheet === "profile"}
        onClose={() => setSheet(null)}
        account={data?.account}
        donor={data?.donor}
        onBecomeDonor={() => {
          setSheet(null);
          onBecomeDonor();
        }}
        onLogout={handleLogout}
      />

      <Sheet open={sheet === "updates"} onClose={() => setSheet(null)} title="Updates">
        <h2 className="sheet__title">Updates</h2>

        {replies.length === 0 ? (
          <p className="sheet__text">
            Nothing yet. When a donor responds to your request, you'll see it here.
          </p>
        ) : (
          <ul className="updates">
            {replies.map((reply) => (
              <li className="updates__item" key={`${reply.phone}-${reply.respondedAt}`}>
                <div>
                  <strong>{reply.name}</strong> can help with your{" "}
                  {reply.requestGroup === "UNKNOWN" ? "blood" : `${reply.requestGroup} blood`}{" "}
                  request
                  <div className="updates__time">{timeAgo(reply.respondedAt)}</div>
                </div>
                <a className="tbtn tbtn--fill" href={`tel:+91${reply.phone}`}>
                  <PhoneIcon />
                  Call
                </a>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </div>
  );
}

export default DashboardScreen;