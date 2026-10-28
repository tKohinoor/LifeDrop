import { useState, useEffect, useRef } from "react";
import useDetectLocation from "./useDetectLocation";

// Owns a location text box: detects on open, stays editable, remembers coordinates.
function useLocationInput() {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const edited = useRef(false); // did the person type their own?
  const { status, detect } = useDetectLocation();

  // override = true is the "Locate me" button, which replaces whatever is typed
  async function locate(override) {
    const result = await detect();
    if (!result) return;
    if (override || !edited.current) {
      setCoords(result.coords);
      if (result.address) setLocation(result.address);
      if (override) edited.current = false;
    }
  }

  useEffect(() => {
    locate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onChange(value) {
    edited.current = true;
    setLocation(value);
    setCoords(null); // typed text no longer matches the detected position
  }

  return { location, coords, status, onChange, locate };
}

export default useLocationInput;