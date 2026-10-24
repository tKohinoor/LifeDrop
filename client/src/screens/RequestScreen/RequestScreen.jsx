import { useState, useEffect } from "react";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader";
import BloodGroupPicker from "../../components/BloodGroupPicker/BloodGroupPicker";
import TextField from "../../components/TextField/TextField";
import Button from "../../components/Button/Button";
import { DropIcon } from "../../components/icons";
import useDetectLocation from "../../hooks/useDetectLocation";
import { createRequest } from "../../api/requests";
import "./RequestScreen.css";

function validate(form) {
  const errors = {};
  if (!form.bloodGroup) errors.bloodGroup = "Choose a blood group";
  if (form.location.trim().length < 3) errors.location = "Enter hospital and area";
  if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = "Enter a valid 10-digit number";
  if (form.name.trim().length < 2) errors.name = "Enter your name";
  return errors;
}

function RequestScreen({ onBack, onSubmit }) {
  const [form, setForm] = useState({ bloodGroup: "", location: "", phone: "", name: "" });
  const [errors, setErrors] = useState({});
  const [coords, setCoords] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { status, detect } = useDetectLocation();

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function applyDetectedLocation(override) {
    const result = await detect();
    if (!result) return;
    setCoords(result.coords);
    if (result.address) {
      setForm((current) =>
        override || !current.location
          ? { ...current, location: result.address }
          : current
      );
    }
  }

  useEffect(() => {
    applyDetectedLocation(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLocationChange(value) {
    setField("location", value);
    setCoords(null);
  }

  function handlePhoneChange(value) {
    setField("phone", value.replace(/\D/g, "").slice(0, 10));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return; // ignore double taps

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      bloodGroup: form.bloodGroup,
      location: form.location.trim(),
      coords,
      phone: form.phone,
      name: form.name.trim(),
    };

    setSending(true);
    setSubmitError("");

    try {
      const saved = await createRequest(payload);
      onSubmit(saved, payload);
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      setSubmitError(error.message);
    } finally {
      setSending(false);
    }
  }

  const locationHint =
    status === "detecting"
      ? "Finding your location…"
      : status === "found"
      ? "Auto-detected · editable"
      : status === "failed"
      ? "Not detected · type it"
      : "";

  const locateButton = status !== "detecting" && (
    <button type="button" className="link-btn" onClick={() => applyDetectedLocation(true)}>
      Locate me
    </button>
  );

  return (
    <div className="request-page">
      <main className="request">
        <ScreenHeader title="Request Blood" onBack={onBack} />

        <form className="request__form" onSubmit={handleSubmit} noValidate>
          <BloodGroupPicker
            value={form.bloodGroup}
            onChange={(value) => setField("bloodGroup", value)}
            error={errors.bloodGroup}
          />

          <TextField
            id="location"
            label="Where is blood needed?"
            placeholder="Hospital name and area"
            value={form.location}
            onChange={handleLocationChange}
            error={errors.location}
            hint={locationHint}
            action={locateButton}
            autoComplete="off"
          />

          <TextField
            id="phone"
            label="Your phone number"
            prefix="+91"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={handlePhoneChange}
            error={errors.phone}
          />

          <TextField
            id="name"
            label="Your name"
            autoComplete="name"
            placeholder="So donors know who to ask for"
            value={form.name}
            onChange={(value) => setField("name", value)}
            error={errors.name}
          />

          <div className="request__submit">
            <Button type="submit" icon={<DropIcon />} disabled={sending}>
              {sending ? "Sending…" : submitError ? "Try Again" : "Find Donors"}
            </Button>

            {submitError ? (
              <p className="request__error" role="alert">{submitError}</p>
            ) : (
              <p className="request__note">Your number is used only to connect you with donors.</p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

export default RequestScreen;