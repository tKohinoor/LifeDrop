import "./CheckField.css";

function CheckField({ id, checked, onChange, error, children }) {
  return (
    <div className="field">
      <label className={`check ${error ? "check--error" : ""}`} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{children}</span>
      </label>

      {/* Fixed-height line again, so an error never shifts the layout */}
      <div className="field__msg">
        {error && (
          <span className="field__error field__msg-text" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export default CheckField;