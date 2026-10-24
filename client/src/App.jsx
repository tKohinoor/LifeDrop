import { useState } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import RequestScreen from "./screens/RequestScreen/RequestScreen";

// Temporary page for screens we haven't built yet
function ComingSoon({ title, onBack, children }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>{title}</h2>
      {children || <p>Coming soon.</p>}
      <button onClick={onBack}>← Back</button>
    </main>
  );
}

function App() {
  // "splash" | "home" | "request" | "sent" | "donor" | "login"
  const [screen, setScreen] = useState("splash");
  const [sentRequest, setSentRequest] = useState(null);
  const goHome = () => setScreen("home");

  function handleRequestSubmit(saved, data) {
    setSentRequest({ saved, data });
    setScreen("sent");
  }

  if (screen === "splash") return <SplashScreen onFinish={goHome} />;

  if (screen === "request") {
    return <RequestScreen onBack={goHome} onSubmit={handleRequestSubmit} />;
  }

  if (screen === "sent") {
    return (
      <ComingSoon title="Request sent" onBack={goHome}>
        <p>Saved in the database with this id:</p>
        <pre>{JSON.stringify(sentRequest.saved, null, 2)}</pre>
      </ComingSoon>
    );
  }

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