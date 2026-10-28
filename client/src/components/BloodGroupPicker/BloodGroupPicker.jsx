import "./BloodGroupPicker.css";

const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function BloodGroupPicker({
  value,
  onChange,
  error,
  label = "Blood group needed",
  allowUnknown = true,
}) {
  return (
    <div className="field" role="radiogroup" aria-labelledby="bgp-label">
      <div className="bgp__head">
        <span className="field__label" id="bgp-label">
          {label}
        </span>
        {error && (
          <span className="field__error" role="alert">
            {error}
          </span>
        )}
      </div>

      <div className="bgp__grid">
        {GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            role="radio"
            aria-checked={value === group}
            className={`bgp__chip ${value === group ? "bgp__chip--on" : ""}`}
            onClick={() => onChange(group)}
          >
            {group}
          </button>
        ))}

        {allowUnknown && (
          <button
            type="button"
            role="radio"
            aria-checked={value === "UNKNOWN"}
            className={`bgp__chip bgp__unsure ${value === "UNKNOWN" ? "bgp__chip--on" : ""}`}
            onClick={() => onChange("UNKNOWN")}
          >
            Not sure (hospital can confirm)
          </button>
        )}
      </div>
    </div>
  );
}

export default BloodGroupPicker;