import { BackIcon } from "../icons";
import "./ScreenHeader.css";

function ScreenHeader({ title, onBack }) {
  return (
    <header className="screen-header">
      <button
        type="button"
        className="screen-header__back"
        onClick={onBack}
        aria-label="Go back"
      >
        <BackIcon />
      </button>
      <h1 className="screen-header__title">{title}</h1>
    </header>
  );
}

export default ScreenHeader;