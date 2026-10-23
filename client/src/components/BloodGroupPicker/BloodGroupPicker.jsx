import "./BloodGroupPicker.css";

const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function BloodGroupPicker({ value, onChange, error }) {
  return (
    <div className="field" role="radiogroup" aria-labelledby="bgp-label">
      {/* Label on the left, error (if any) on the right, same row */}
      <div className="bgp__head">
        <span className="field__label" id="bgp-label">
          Blood group needed
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

        <button
          type="button"
          role="radio"
          aria-checked={value === "UNKNOWN"}
          className={`bgp__chip bgp__unsure ${value === "UNKNOWN" ? "bgp__chip--on" : ""}`}
          onClick={() => onChange("UNKNOWN")}
        >
          Not sure (hospital can confirm)
        </button>
      </div>
    </div>
  );
}

export default BloodGroupPicker;