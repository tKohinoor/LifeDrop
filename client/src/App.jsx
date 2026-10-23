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
  // Which screen is showing: "splash" | "home" | "request" | "searching" | "donor" | "login"
  const [screen, setScreen] = useState("splash");
  const [requestData, setRequestData] = useState(null);
  const goHome = () => setScreen("home");

  function handleRequestSubmit(data) {
    console.log("Blood request:", data);
    setRequestData(data);
    setScreen("searching");
  }

  if (screen === "splash") return <SplashScreen onFinish={goHome} />;

  if (screen === "request") {
    return <RequestScreen onBack={goHome} onSubmit={handleRequestSubmit} />;
  }

  if (screen === "searching") {
    return (
      <ComingSoon title="Finding donors…" onBack={() => setScreen("request")}>
        <p>Here is exactly what the form collected:</p>
        <pre>{JSON.stringify(requestData, null, 2)}</pre>
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