import { useEffect, useState } from "react";
import DropLogo from "../DropLogo/DropLogo";
import "./SplashScreen.css";

function SplashScreen({ onFinish, duration = 2800 }) {
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // After `duration`, start fading out
        const fadeTimer = setTimeout(() => setLeaving(true), duration);
        // 400ms later (fade finished), tell the parent we're done
        const doneTimer = setTimeout(onFinish, duration + 400);

        // Cleanup: cancel timers if the component disappears early
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [duration, onFinish]);

    return (
        <div className={`splash ${leaving ? "splash--leaving" : ""}`}>
            <div className="splash__blob splash__blob--top" />
            <div className="splash__blob splash__blob--bottom" />

            <DropLogo animated size="min(42vw, 170px)" />

            <h1 className="splash__wordmark">
                Life<span>Drop</span>
            </h1>
            <p className="splash__tagline">Get Blood. Urgently.</p>

            <div className="splash__spinner" role="status" aria-label="Loading" />
        </div>
    );
}

export default SplashScreen;