import { useState } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";

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
  // Which screen is showing: "splash" | "home" | "request" | "donor" | "login"
  const [screen, setScreen] = useState("splash");
  const goHome = () => setScreen("home");

  if (screen === "splash") {
    return <SplashScreen onFinish={goHome} />;
  }
  if (screen === "request") return <ComingSoon title="Request Blood" onBack={goHome} />;
  if (screen === "donor") return <ComingSoon title="Become a Donor" onBack={goHome} />;
  if (screen === "login") return <ComingSoon title="Log In" onBack={goHome} />;

  return (
    <HomeScreen
      onRequestBlood={() => setScreen("request")}
      onBecomeDonor={() => setScreen("donor")}
      onLogin={() => setScreen("login")}
    />
  );
}

export default App;