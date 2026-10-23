import { useState } from "react";
import SplashScreen from "./components/SplashScreen/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Placeholder until we design the real home screen
  return (
    <main style={{ padding: 24 }}>
      <h2>LifeDrop</h2>
      <p>Home screen coming next.</p>
    </main>
  );
}

export default App;