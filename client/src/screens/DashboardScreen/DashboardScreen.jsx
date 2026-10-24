import { useState, useEffect, useCallback } from "react";
import DropLogo from "../../components/DropLogo/DropLogo";
import Button from "../../components/Button/Button";
import Sheet from "../../components/Sheet/Sheet";
import TicketCard from "../../components/TicketCard/TicketCard";
import ProfileSheet from "../../components/ProfileSheet/ProfileSheet";
import { FaceIcon, BellIcon, PlusIcon, ShieldIcon } from "../../components/icons";
import { getMe } from "../../api/requests";
import { clearSession } from "../../api/session";
import "./DashboardScreen.css";

function DashboardScreen({ onNewRequest, onSignedOut }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [sheet, setSheet] = useState(null); // "profile" | "updates" | null

  const load = useCallback(async () => {
    try {
      setData(await getMe());
      setLoadError("");
    } catch (error) {
      if (error.unauthorized) {
        onSignedOut(); // the server doesn't recognise this phone any more
        return;
      }
      setLoadError(error.message);
    }
  }, [onSignedOut]);

  // Load when the screen opens, and again whenever the person returns to the app
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

        <main className="dash__body">
          {!data && !loadError && <p className="dash__status">Loading your requests…</p>}

          {!data && loadError && (
            <div className="dash__status">
              <p>{loadError}</p>
              <button type="button" className="link-btn" onClick={load}>
                Try again
              </button>
            </div>
          )}

          {data && tickets.length === 0 && (
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

          {data && tickets.length > 0 && !data.account.phoneVerified && (
            <button type="button" className="dash__nudge" onClick={() => setSheet("profile")}>
              <ShieldIcon />
              Verify your number so donors can trust your request
            </button>
          )}
        </main>

        <footer className="dash__footer">
          <Button
            variant={tickets.length > 0 ? "secondary" : "primary"}
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
        onLogout={handleLogout}
      />

      <Sheet open={sheet === "updates"} onClose={() => setSheet(null)} title="Updates">
        <h2 className="sheet__title">Updates</h2>
        <p className="sheet__text">
          Nothing yet. When a donor responds to your request, you'll see it here.
        </p>
      </Sheet>
    </div>
  );
}

export default DashboardScreen;