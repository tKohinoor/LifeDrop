import { useState, useCallback } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import RequestScreen from "./screens/RequestScreen/RequestScreen";
import DonorScreen from "./screens/DonorScreen/DonorScreen";
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
  // "splash" | "home" | "request" | "donor" | "dashboard" | "login"
  const [screen, setScreen] = useState("splash");
  const [dashTab, setDashTab] = useState("mine"); // which tab the dashboard opens on

  const goStart = useCallback(
    () => setScreen(getToken() ? "dashboard" : "home"),
    []
  );
  const goHome = useCallback(() => setScreen("home"), []);

  if (screen === "splash") return <SplashScreen onFinish={goStart} />;

  if (screen === "request") {
    return (
      <RequestScreen
        onBack={goStart}
        onSubmit={() => {
          setDashTab("mine");
          setScreen("dashboard");
        }}
      />
    );
  }

  if (screen === "donor") {
    return (
      <DonorScreen
        onBack={goStart}
        onDone={() => {
          setDashTab("help"); // a new donor lands on "Help others"
          setScreen("dashboard");
        }}
      />
    );
  }

  if (screen === "dashboard") {
    return (
      <DashboardScreen
        initialTab={dashTab}
        onNewRequest={() => {
          setDashTab("mine");
          setScreen("request");
        }}
        onBecomeDonor={() => setScreen("donor")}
        onSignedOut={goHome}
      />
    );
  }

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