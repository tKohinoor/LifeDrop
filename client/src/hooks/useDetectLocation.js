import { useState, useCallback } from "react";

// Turns coordinates into a readable address using OpenStreetMap (free, no key).
async function lookupAddress(lat, lng) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${lat}&lon=${lng}&zoom=17`;
  const response = await fetch(url);
  const data = await response.json();
  return data.display_name || "";
}

function useDetectLocation() {
  // idle | detecting | found | failed
  const [status, setStatus] = useState("idle");

  // Returns a promise: { coords, address } on success, or null if it failed.
  const detect = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setStatus("failed");
        resolve(null);
        return;
      }

      setStatus("detecting");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          let address = "";
          try {
            address = await lookupAddress(coords.lat, coords.lng);
          } catch {
            // No internet for the lookup: we still have the coordinates
          }

          setStatus(address ? "found" : "failed");
          resolve({ coords, address });
        },
        () => {
          // Permission denied, no signal, or timed out
          setStatus("failed");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return { status, detect };
}

export default useDetectLocation;