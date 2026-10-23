import "./TextField.css";

function TextField({ id, label, value, onChange, error, hint, action, prefix, ...inputProps }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      <div className={`input ${error ? "input--error" : ""}`}>
        {prefix && <span className="input__prefix">{prefix}</span>}
        <input
          id={id}
          className="input__control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${id}-msg`}
          {...inputProps}
        />
      </div>

      {/* This line is always present, so the layout never shifts */}
      <div className="field__msg">
        {error ? (
          <span className="field__error field__msg-text" id={`${id}-msg`} role="alert">
            {error}
          </span>
        ) : (
          <span className="field__msg-text" id={`${id}-msg`}>
            {hint}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

export default TextField;