import { useState } from "react";
import ScreenHeader from "../../components/ScreenHeader/ScreenHeader";
import BloodGroupPicker from "../../components/BloodGroupPicker/BloodGroupPicker";
import TextField from "../../components/TextField/TextField";
import CheckField from "../../components/CheckField/CheckField";
import Button from "../../components/Button/Button";
import { DropIcon } from "../../components/icons";
import useLocationInput from "../../hooks/useLocationInput";
import { registerDonor } from "../../api/requests";
import { getToken, getProfile } from "../../api/session";
import "./DonorScreen.css";

function validate(form, location, needsContact) {
  const errors = {};
  if (!form.bloodGroup) errors.bloodGroup = "Choose your group";
  if (location.trim().length < 3) errors.location = "Enter your area";
  if (needsContact) {
    if (form.name.trim().length < 2) errors.name = "Enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = "Enter a valid 10-digit number";
  }
  if (!form.confirmed) errors.confirmed = "Please confirm to continue";
  return errors;
}

function DonorScreen({ onBack, onDone }) {
  const profile = getProfile();
  // Someone who already has an account is not asked for their name and number again
  const [hasAccount, setHasAccount] = useState(Boolean(getToken()));
  const [form, setForm] = useState({
    bloodGroup: "",
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    confirmed: false,
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const place = useLocationInput();

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;

    const found = validate(form, place.location, !hasAccount);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      bloodGroup: form.bloodGroup,
      location: place.location.trim(),
      coords: place.coords,
      confirmed: form.confirmed,
    };
    if (!hasAccount) {
      payload.name = form.name.trim();
      payload.phone = form.phone;
    }

    setSending(true);
    setSubmitError("");

    try {
      await registerDonor(payload);
      onDone();
    } catch (error) {
      const contactMissing = error.fieldErrors?.name || error.fieldErrors?.phone;

      if (error.unauthorized || (hasAccount && contactMissing)) {
        // The saved account is no longer recognised: ask for name and number
        setHasAccount(false);
        setSubmitError("Please enter your name and number.");
      } else {
        if (error.fieldErrors) setErrors(error.fieldErrors);
        setSubmitError(error.message);
      }
    } finally {
      setSending(false);
    }
  }

  const hint =
    place.status === "detecting"
      ? "Finding your location…"
      : place.status === "found"
      ? "Auto-detected · editable"
      : place.status === "failed"
      ? "Not detected · type it"
      : "";

  const locateButton = place.status !== "detecting" && (
    <button type="button" className="link-btn" onClick={() => place.locate(true)}>
      Locate me
    </button>
  );

  return (
    <div className="donor-page">
      <main className="donor">
        <ScreenHeader title="Become a Donor" onBack={onBack} />

        <form className="donor__form" onSubmit={handleSubmit} noValidate>
          <BloodGroupPicker
            label="Your blood group"
            allowUnknown={false}
            value={form.bloodGroup}
            onChange={(value) => setField("bloodGroup", value)}
            error={errors.bloodGroup}
          />

          <TextField
            id="donor-location"
            label="Where can you donate from?"
            placeholder="Your area or locality"
            value={place.location}
            onChange={(value) => {
              place.onChange(value);
              setErrors((current) => ({ ...current, location: undefined }));
            }}
            error={errors.location}
            hint={hint}
            action={locateButton}
            autoComplete="off"
          />

          {!hasAccount && (
            <>
              <TextField
                id="donor-name"
                label="Your name"
                autoComplete="name"
                placeholder="Full name"
                value={form.name}
                onChange={(value) => setField("name", value)}
                error={errors.name}
              />

              <TextField
                id="donor-phone"
                label="Your phone number"
                prefix="+91"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(value) => setField("phone", value.replace(/\D/g, "").slice(0, 10))}
                error={errors.phone}
              />
            </>
          )}

          <CheckField
            id="donor-confirm"
            checked={form.confirmed}
            onChange={(checked) => setField("confirmed", checked)}
            error={errors.confirmed}
          >
            I am 18+ and healthy to donate
          </CheckField>

          <div className="donor__submit">
            <Button type="submit" icon={<DropIcon />} disabled={sending}>
              {sending ? "Saving…" : submitError ? "Try Again" : "Register as Donor"}
            </Button>

            {submitError ? (
              <p className="donor__error" role="alert">{submitError}</p>
            ) : (
              <p className="donor__note">Your number is shared only when you tap "I can help".</p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

export default DonorScreen;