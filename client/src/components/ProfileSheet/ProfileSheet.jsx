import { useState } from "react";
import Sheet from "../Sheet/Sheet";
import { FaceIcon, ShieldIcon, UsersIcon, PhoneIcon, LogoutIcon } from "../icons";
import "./ProfileSheet.css";

function ProfileSheet({ open, onClose, account, onLogout }) {
  const [confirming, setConfirming] = useState(false);

  function close() {
    setConfirming(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title="Your profile">
      <div className="profile__head">
        <span className="profile__avatar">
          <FaceIcon />
        </span>
        <div>
          <div className="profile__name">{account?.name}</div>
          <div className="profile__phone">
            +91 {account?.phone} · {account?.phoneVerified ? "Verified" : "Not verified"}
          </div>
        </div>
      </div>

      <ul className="menu">
        <li>
          <div className="menu__row menu__row--soon">
            <ShieldIcon />
            <span className="menu__label">Verify phone number</span>
            <span className="menu__tag">Soon</span>
          </div>
        </li>
        <li>
          <div className="menu__row menu__row--soon">
            <UsersIcon />
            <span className="menu__label">Become a donor</span>
            <span className="menu__tag">Soon</span>
          </div>
        </li>
        <li>
          <a className="menu__row" href="tel:108">
            <PhoneIcon />
            <span className="menu__label">Call ambulance (108)</span>
          </a>
        </li>
        <li>
          {confirming ? (
            <div className="logout-confirm">
              <p>
                You won't be able to get back to your active requests on this phone.
                Log out anyway?
              </p>
              <div className="logout-confirm__actions">
                <button type="button" className="tbtn" onClick={() => setConfirming(false)}>
                  Stay
                </button>
                <button type="button" className="tbtn tbtn--fill" onClick={onLogout}>
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="menu__row" onClick={() => setConfirming(true)}>
              <LogoutIcon />
              <span className="menu__label">Log out</span>
            </button>
          )}
        </li>
      </ul>
    </Sheet>
  );
}

export default ProfileSheet;