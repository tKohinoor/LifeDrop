import { ArrowIcon } from "../icons";
import "./Button.css";

// variant: "primary" (big, filled) or "secondary" (smaller, outlined)
function Button({ variant = "primary", icon, onClick, children }) {
  return (
    <button type="button" className={`btn btn--${variant}`} onClick={onClick}>
      {icon}
      <span className="btn__label">{children}</span>
      <ArrowIcon />
    </button>
  );
}

export default Button;