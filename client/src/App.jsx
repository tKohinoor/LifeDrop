import { useState, useCallback } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import RequestScreen from "./screens/RequestScreen/RequestScreen";
import DashboardScreen from "./screens/DashboardScreen/DashboardScreen";
import { getToken } from "./api/session";

// Temporary page for screens we haven't built yet
function ComingSoon({ title, onBack }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>{title}</h2>
      <p>Coming soon.</p>
      <button onClick={onBack}>← Back</button>
    </main>
  );
}

function App() {
  // "splash" | "home" | "request" | "dashboard" | "donor" | "login"
  const [screen, setScreen] = useState("splash");

  // A phone that already has an account starts on the dashboard, a new one on home.
  const goStart = useCallback(
    () => setScreen(getToken() ? "dashboard" : "home"),
    []
  );
  const goHome = useCallback(() => setScreen("home"), []);

  if (screen === "splash") return <SplashScreen onFinish={goStart} />;

  if (screen === "request") {
    return <RequestScreen onBack={goStart} onSubmit={() => setScreen("dashboard")} />;
  }

  if (screen === "dashboard") {
    return (
      <DashboardScreen
        onNewRequest={() => setScreen("request")}
        onSignedOut={goHome}
      />
    );
  }

  if (screen === "donor") return <ComingSoon title="Become a Donor" onBack={goStart} />;
  if (screen === "login") return <ComingSoon title="Log In" onBack={goStart} />;

  return (
    <HomeScreen
      onRequestBlood={() => setScreen("request")}
      onBecomeDonor={() => setScreen("donor")}
      onLogin={() => setScreen("login")}
    />
  );
}

export default App;